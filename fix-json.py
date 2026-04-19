#!/usr/bin/env python3
"""
JSON Fixer for Unreal Dialogue Files

This script fixes malformed JSON files that are missing array brackets.
Common issue: {obj1},{obj2},{obj3} instead of [{obj1},{obj2},{obj3}]

Usage:
    python fix-json.py input.json output.json
    python fix-json.py output.json  (overwrites input file)
"""

import sys
import json
import os


def fix_json_format(content: str) -> str:
    """
    Fix malformed JSON by wrapping in array brackets if needed.

    Args:
        content: Raw JSON string content

    Returns:
        Fixed JSON string
    """
    content = content.strip()

    # Try parsing as-is first
    try:
        json.loads(content)
        print("✅ JSON is already valid!")
        return content
    except json.JSONDecodeError:
        pass

    # Check if it's missing array brackets
    # Pattern: starts with { and ends with }
    if content.startswith('{') and content.endswith('}'):
        # Check if there are multiple objects (comma-separated)
        # Simple heuristic: look for },{
        if '},{' in content:
            print("🔧 Detected missing array brackets. Fixing...")
            fixed_content = f"[{content}]"

            # Validate the fix
            try:
                json.loads(fixed_content)
                print("✅ Successfully fixed JSON!")
                return fixed_content
            except json.JSONDecodeError as e:
                print(f"❌ Still invalid after fix: {e}")
                raise
        else:
            # Single object without brackets
            print("🔧 Wrapping single object in array...")
            fixed_content = f"[{content}]"
            try:
                json.loads(fixed_content)
                print("✅ Successfully wrapped!")
                return fixed_content
            except json.JSONDecodeError as e:
                print(f"❌ Invalid JSON: {e}")
                raise

    # If it starts with [ and ends with ], it's probably already an array
    if content.startswith('[') and content.endswith(']'):
        print("❌ JSON appears to be an array but has parsing errors")
        try:
            json.loads(content)
        except json.JSONDecodeError as e:
            print(f"Error: {e}")
            raise

    print("❌ Cannot automatically fix this JSON format")
    raise ValueError("Unrecognized JSON format")


def main():
    if len(sys.argv) < 2:
        print("Usage: python fix-json.py <input_file> [output_file]")
        print("If output_file is not provided, input_file will be overwritten")
        sys.exit(1)

    input_file = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 else input_file

    # Check if input file exists
    if not os.path.exists(input_file):
        print(f"❌ Error: File '{input_file}' not found")
        sys.exit(1)

    print(f"📖 Reading: {input_file}")

    # Read the file
    with open(input_file, 'r', encoding='utf-8') as f:
        content = f.read()

    print(f"📏 File size: {len(content)} characters")

    # Fix the JSON
    try:
        fixed_content = fix_json_format(content)
    except Exception as e:
        print(f"❌ Failed to fix JSON: {e}")
        sys.exit(1)

    # Pretty print the JSON
    parsed = json.loads(fixed_content)
    pretty_json = json.dumps(parsed, indent=2)

    # Write the output
    print(f"💾 Writing: {output_file}")
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(pretty_json)

    print(f"✅ Done! Fixed JSON saved to: {output_file}")
    print(f"📊 Total objects: {len(parsed) if isinstance(parsed, list) else 1}")


if __name__ == "__main__":
    main()
