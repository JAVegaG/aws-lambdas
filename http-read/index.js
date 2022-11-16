const AWS = require("aws-sdk");

const dynamo = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event, context) => {
    let body;
    let statusCode = 200;
    const headers = {
        "Content-Type": "application/json"
    };

    try {
        switch (event.routeKey) {
            case "GET /books/{id}":
                body = await dynamo
                    .get({
                        TableName: "books", // db-name
                        Key: {
                            id: Number(event.pathParameters.id)
                        }
                    })
                    .promise();
                break;
            case "GET /books":
                body = await dynamo.scan({ TableName: "books" }).promise();
                break;
            default:
                throw new Error(`Unsupported route: "${event.routeKey}"`);
        }
    } catch (err) {
        statusCode = 400;
        body = err.message;
    } finally {
        body = JSON.stringify(body);
    }

    return {
        statusCode,
        body,
        headers
    };
};