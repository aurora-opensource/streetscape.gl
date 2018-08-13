# Frequently Asked Questions

*Uber Confidential Information*


## Data Format Related Questions

### Coordinate Systems

It is clearer to a new comer to have an object, but based on my own experience it gets confusing fast when different parts of the code use different conventions. It is so easy to get silent failures in an untyped system like JavaScript.

I'd recommend sticking with this convention (used by GeoJSON, mapbox-gl, deck.gl, ...) but document it carefully in a page about coordinate systems and also add a FAQ entry about it.

We generally support three coordinates as `[longitude(degrees), latitude(degrees), altitude(meters)]`.

See [deck.gl](http://deck.gl/#/documentation/developer-guide/coordinate-systems)
