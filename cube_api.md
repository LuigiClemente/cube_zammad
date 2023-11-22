# REST API Documentation for Cube

## Overview

Cube is a Semantic Layer designed for building data applications. This documentation provides information on the Cube REST API, specifically focusing on the [`/v1/load`](https://cube.dev/docs/reference/rest-api#v1load) endpoint.

### Endpoint: `/v1/load`

#### Get Data for a Query

Retrieve data for a given query using the [`/v1/load`](https://cube.dev/docs/reference/rest-api#v1load) endpoint.

##### Parameters

| Parameter | Description |
| --- | --- |
| `query` | Either a single URL encoded Cube [Query](https://cube.dev/docs/product/apis-integrations/rest-api/query-format), or an array of queries |
| `queryType` | If multiple queries are passed in `query` for [data blending](https://cube.dev/docs/product/data-modeling/concepts/data-blending#data-blending), set this to `multi` |

##### Response

The response includes the following:

* `query`: The query passed via parameters, treated as a [Data Blending](https://cube.dev/docs/product/data-modeling/concepts/data-blending#data-blending) query if it is an array.
* `data`: Formatted dataset of query results.
* `annotation`: Metadata for the query, containing descriptions for all query items.
    * `title`: Human-readable title from the data model.
    * `shortTitle`: Short title for visualization usage (e.g., chart overlay).
    * `type`: Data type.
* `total`: The total number of rows returned for the query, useful for paginating results.

##### Response Format

The response format mirrors the structure described above, with detailed information about the query, formatted data, and metadata.

##### Example Request:

```bash
# Request with http method GET
curl \
  -H "Authorization: EXAMPLE-API-TOKEN" \
  -G \
  --data-urlencode 'query={"measures":["users.count"]}' \
  http://localhost:4000/cubejs-api/v1/load

# Request with http method POST
# Use POST to address query length limits
curl \
 -X POST  \
 -H "Content-Type: application/json" \
 -H "Authorization: EXAMPLE-API-TOKEN" \
 --data '{"query": {"measures":["users.count"]}}' \
 http://localhost:4000/cubejs-api/v1/load
```

##### Example Response:

```json
{
  "query": {
    "measures": ["users.count"],
    "filters": [],
    "timezone": "UTC",
    "dimensions": [],
    "timeDimensions": []
  },
  "data": [
    {
      "users.count": "700"
    }
  ],
  "annotation": {
    "measures": {
      "users.count": {
        "title": "Users Count",
        "shortTitle": "Count",
        "type": "number"
      }
    },
    "dimensions": {},
    "segments": {},
    "timeDimensions": {}
  }
}
```

**Note:** Numerical values are returned in the format provided by the driver, often as strings. Client code should handle parsing accordingly to avoid loss of significance.

For more details, refer to the [official Cube REST API documentation](https://cube.dev/docs/reference/rest-api).
