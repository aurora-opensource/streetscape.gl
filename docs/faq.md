# Frequently Asked Questions

_Uber Confidential Information_

## Data Format Related Questions

### Why are Coordinates specified as arrays instead of objects

Many newcomers feel it would be more intuitive to use `{longitude: , latitude: }` rather than as a
"reverse" array `[lng, lat]`.

streetscape.gl and XVIZ follow a JavaScript "convention" (used by GeoJSON, mapbox-gl, deck.gl, etc).
Following the same convention across all these libraries is valuable as users start to use more
functionality from the stack.

In addition, the array notation does have some advantages:

- It corresponds to `[x, y]` coordinates.
- It uses standard arrays which works with many math libraries.

Finally note that positions typically support three coordinates as
`[longitude(degrees), latitude(degrees), altitude(meters above sea level)]`, with the last value
default to `0`.

See [deck.gl](http://deck.gl/#/documentation/developer-guide/coordinate-systems)
