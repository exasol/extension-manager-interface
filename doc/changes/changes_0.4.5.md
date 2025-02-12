# Extension Manager Interface 0.4.5, released 2025-02-12

Code name: Fix boolean parameter serialization

## Summary

This release fixes an issue with the serialization of boolean parameters, that were serialized to JSON as a 
string value `"true"` / `"false"` instead of using the literal values `true` / `false`

## Bugfixes

* #63: boolean parameters are serialized as string
