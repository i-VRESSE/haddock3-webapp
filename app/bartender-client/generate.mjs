import fs from "node:fs";
import openapiTS, { astToString } from "openapi-typescript";
import ts from "typescript";

const bartenderApiUrl =
  process.env["BARTENDER_API_URL"] || "http://localhost:8000";
const mySchema = new URL(`${bartenderApiUrl}/api/openapi.json`);

// Support for `format: binary` see
// https://openapi-ts.pages.dev/node#example-blob-types
const BLOB = ts.factory.createIdentifier("Blob"); // `Blob`
const NULL = ts.factory.createLiteralTypeNode(ts.factory.createNull()); // `null`
const ast = await openapiTS(mySchema, {
  transform(schemaObject, metadata) {
    if (schemaObject.format === "binary") {
      return schemaObject.nullable
        ? ts.factory.createUnionTypeNode([BLOB, NULL])
        : BLOB;
    }
  },
});

const header = `// This file was generated with "npm run generate-client" command.
// Do not edit this file manually.

`;

const contents = header + astToString(ast);

const fn = "app/bartender-client/bartenderschema.d.ts";
fs.writeFileSync(fn, contents);

console.log(`Written ${fn}`);
