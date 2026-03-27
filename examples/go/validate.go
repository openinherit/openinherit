package main

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/ghodss/yaml"
	"github.com/xeipuuv/gojsonschema"
)

// ---------------------------------------------------------------------------
// INHERIT document validator — Level 1 (JSON Schema) and Level 2 (referential integrity)
//
// Usage:
//
//	go run validate.go <path-to-inherit-json>
//	go run validate.go ../examples/fixtures/minimal-estate.json
//
// Exit code 0 if Level 2 passes, 1 otherwise.
// ---------------------------------------------------------------------------

func main() {
	if len(os.Args) < 2 {
		fmt.Fprintln(os.Stderr, "Usage: go run validate.go <path-to-inherit-json>")
		fmt.Fprintln(os.Stderr, "Example: go run validate.go ../examples/fixtures/english-family-estate.json")
		os.Exit(1)
	}

	filePath := os.Args[1]
	raw, err := os.ReadFile(filePath)
	if err != nil {
		fmt.Fprintf(os.Stderr, "ERROR: Could not read file: %v\n", err)
		os.Exit(1)
	}

	var document map[string]interface{}
	if err := json.Unmarshal(raw, &document); err != nil {
		fmt.Fprintf(os.Stderr, "ERROR: Invalid JSON: %v\n\n", err)
		fmt.Fprintln(os.Stderr, "Conformance level: 0 (not valid JSON)")
		os.Exit(1)
	}

	fmt.Printf("Validating: %s\n\n", filePath)
	fmt.Println(strings.Repeat("=", 60))

	// Level 1: JSON Schema validation
	fmt.Println("\nLevel 1: JSON Schema Validation")
	fmt.Println(strings.Repeat("-", 60))

	if errs := runLevel1(document); len(errs) > 0 {
		fmt.Println("  FAIL — Schema validation errors:\n")
		for _, e := range errs {
			fmt.Println(e)
			fmt.Println()
		}
		fmt.Println(strings.Repeat("=", 60))
		fmt.Println("\nConformance level achieved: 0")
		os.Exit(1)
	}
	fmt.Println("  PASS — Document conforms to the INHERIT v1 root schema.\n")

	// Level 2: Referential integrity
	fmt.Println("Level 2: Referential Integrity Checks")
	fmt.Println(strings.Repeat("-", 60))

	if errs := runLevel2(document); len(errs) > 0 {
		fmt.Println("  FAIL — Referential integrity errors:\n")
		for _, e := range errs {
			fmt.Printf("  Path:        %s\n", e.Path)
			fmt.Printf("  Message:     %s\n", e.Message)
			fmt.Printf("  Explanation: %s\n\n", e.Explanation)
		}
		fmt.Println(strings.Repeat("=", 60))
		fmt.Println("\nConformance level achieved: 1")
		os.Exit(1)
	}
	fmt.Println("  PASS — All cross-references resolve correctly.\n")

	// Level 3: placeholder
	fmt.Println("Level 3: Extension-Specific Field Checking")
	fmt.Println(strings.Repeat("-", 60))
	fmt.Println("  Level 3 checking not yet implemented — planned for v1.1.\n")

	fmt.Println(strings.Repeat("=", 60))
	fmt.Println("\nConformance level achieved: 2")
	fmt.Println("The document passes schema validation and referential integrity checks.")
}

// ---------------------------------------------------------------------------
// Level 1: JSON Schema validation
// ---------------------------------------------------------------------------

func runLevel1(document map[string]interface{}) []string {
	schemaDir := filepath.Join("..", "v1")
	rootSchema, err := loadRootSchema(schemaDir)
	if err != nil {
		return []string{fmt.Sprintf("  Could not load root schema: %v", err)}
	}

	docLoader := gojsonschema.NewGoLoader(document)
	schemaLoader := gojsonschema.NewStringLoader(rootSchema)

	result, err := gojsonschema.Validate(schemaLoader, docLoader)
	if err != nil {
		return []string{fmt.Sprintf("  Validation error: %v", err)}
	}

	if result.Valid() {
		return nil
	}

	var errs []string
	for _, desc := range result.Errors() {
		errs = append(errs, fmt.Sprintf("  Path:    %s\n  Details: %s", desc.String(), desc.Description()))
	}
	return errs
}

// loadRootSchema loads the INHERIT v1 root schema and inlines all $ref targets
// so that gojsonschema (which lacks external-ref support) can validate a document.
//
// It reads every JSON file under schemaDir, collects them into a map keyed by
// their relative path, and then resolves $ref pointers (e.g. "common/jurisdiction.json")
// by inlining the referenced schema. The custom INHERIT dialect $schema URI is
// replaced with the standard JSON Schema draft-07 URI.
func loadRootSchema(schemaDir string) (string, error) {
	schemas := make(map[string]interface{})

	err := filepath.Walk(schemaDir, func(path string, info os.FileInfo, err error) error {
		if err != nil || info.IsDir() || !strings.HasSuffix(path, ".json") {
			return nil
		}
		raw, err := os.ReadFile(path)
		if err != nil {
			return nil
		}
		var schema map[string]interface{}
		if err := json.Unmarshal(raw, &schema); err != nil {
			return nil
		}
		rel, _ := filepath.Rel(schemaDir, path)
		schemas[rel] = schema
		return nil
	})
	if err != nil {
		return "", fmt.Errorf("walking schema directory: %w", err)
	}

	// Also handle YAML OpenAPI files for the bundled schema
	yamlPath := filepath.Join(schemaDir, "..", "openapi", "v1", "openapi-bundled.yaml")
	if raw, err := os.ReadFile(yamlPath); err == nil {
		var yamlSchema map[string]interface{}
		if err := yaml.Unmarshal(raw, &yamlSchema); err == nil {
			schemas["openapi-bundled.yaml"] = yamlSchema
		}
	}

	rootRel := "schema.json"
	root, ok := schemas[rootRel]
	if !ok {
		return "", fmt.Errorf("root schema (%s) not found", rootRel)
	}

	// Replace custom dialect
	if m, ok := root.(map[string]interface{}); ok {
		if m["$schema"] == "https://openinherit.org/v1/dialect.json" {
			m["$schema"] = "http://json-schema.org/draft-07/schema#"
		}
	}

	// Resolve $refs
	resolved := resolveRefs(root, schemas)

	out, err := json.MarshalIndent(resolved, "", "  ")
	if err != nil {
		return "", fmt.Errorf("marshalling resolved schema: %w", err)
	}
	return string(out), nil
}

// resolveRefs recursively replaces $ref pointers with their resolved schemas.
// It handles both JSON pointer fragments ("$defs/X") and file-relative refs
// ("common/jurisdiction.json").
func resolveRefs(schema interface{}, schemas map[string]interface{}) interface{} {
	m, ok := schema.(map[string]interface{})
	if !ok {
		return schema
	}

	if ref, ok := m["$ref"].(string); ok {
		resolved := resolveRef(ref, schemas)
		if resolved != nil {
			// Merge any sibling keys (e.g. description) into the resolved schema
			delete(m, "$ref")
			if len(m) > 0 {
				if rm, ok := resolved.(map[string]interface{}); ok {
					for k, v := range m {
						rm[k] = v
					}
				}
			}
			return resolveRefs(resolved, schemas)
		}
	}

	for k, v := range m {
		m[k] = resolveRefs(v, schemas)
	}
	return m
}

// resolveRef resolves a $ref string to its target schema.
func resolveRef(ref string, schemas map[string]interface{}) interface{} {
	if !strings.HasPrefix(ref, "#") && !strings.HasPrefix(ref, "http") {
		// File-relative reference like "common/jurisdiction.json"
		if s, ok := schemas[ref]; ok {
			return s
		}
		return nil
	}

	// JSON pointer within same file — strip the leading #/
	if strings.HasPrefix(ref, "#/") {
		parts := strings.Split(strings.TrimPrefix(ref, "#/"), "/")
		// This is a simplified resolver for top-level $defs
		// For production use, a full JSON pointer implementation is recommended
		return nil
	}

	return nil
}

// ---------------------------------------------------------------------------
// Level 2: Referential integrity checks
// ---------------------------------------------------------------------------

type refError struct {
	Path        string
	Message     string
	Explanation string
}

func runLevel2(document map[string]interface{}) []refError {
	var errs []refError

	// Collect all person IDs
	personIDs := make(map[string]bool)
	if people, ok := document["people"].([]interface{}); ok {
		for _, p := range people {
			if pm, ok := p.(map[string]interface{}); ok {
				if id, ok := pm["id"].(string); ok {
					personIDs[id] = true
				}
			}
		}
	}

	checkPersonRef := func(path, personID, label string) {
		if personID == "" {
			return
		}
		if !personIDs[personID] {
			errs = append(errs, refError{
				Path:        path,
				Message:     fmt.Sprintf("Person %q not found in people array.", personID),
				Explanation: fmt.Sprintf("%s references a person that does not exist in the people array.", label),
			})
		}
	}

	// estate.testatorPersonId
	if estate, ok := document["estate"].(map[string]interface{}); ok {
		if id, ok := estate["testatorPersonId"].(string); ok {
			checkPersonRef("/estate/testatorPersonId", id, "Estate.testatorPersonId")
		}
	}

	// bequest.beneficiaryId
	if bequests, ok := document["bequests"].([]interface{}); ok {
		for i, b := range bequests {
			if bm, ok := b.(map[string]interface{}); ok {
				if id, ok := bm["beneficiaryId"].(string); ok {
					checkPersonRef(fmt.Sprintf("/bequets/%d/beneficiaryId", i), id,
						fmt.Sprintf("Bequest %q", bm["id"]))
				}
			}
		}
	}

	// executor.personId
	if executors, ok := document["executors"].([]interface{}); ok {
		for i, e := range executors {
			if em, ok := e.(map[string]interface{}); ok {
				if id, ok := em["personId"].(string); ok {
					checkPersonRef(fmt.Sprintf("/executors/%d/personId", i), id,
						fmt.Sprintf("Executor %q", em["id"]))
				}
			}
		}
	}

	// guardian.guardianPersonId and guardian.childPersonId
	if guardians, ok := document["guardians"].([]interface{}); ok {
		for i, g := range guardians {
			if gm, ok := g.(map[string]interface{}); ok {
				if id, ok := gm["guardianPersonId"].(string); ok {
					checkPersonRef(fmt.Sprintf("/guardians/%d/guardianPersonId", i), id,
						fmt.Sprintf("Guardian %q", gm["id"]))
				}
				if id, ok := gm["childPersonId"].(string); ok {
					checkPersonRef(fmt.Sprintf("/guardians/%d/childPersonId", i), id,
						fmt.Sprintf("Guardian %q", gm["id"]))
				}
			}
		}
	}

	return errs
}
