const AWS = require("aws-sdk");

const dynamo = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event, context) => {
    let body;
    let statusCode = 200;
    const headers = {
        "Content-Type": "application/json"
    };

    try {
        let requestJSON;
        switch (event.routeKey) {
            case "DELETE /books/{id}":
                await dynamo
                    .delete({
                        TableName: "books",
                        Key: {
                            id: Number(event.pathParameters.id)
                        }
                    })
                    .promise();
                body = `Deleted book ${event.pathParameters.id}`;
                break;
            case "POST /books":
                requestJSON = JSON.parse(event.body);
                await dynamo
                    .put({
                        TableName: "books",
                        Item: {
                            id: requestJSON.id,
                            author: requestJSON.author,
                            description: requestJSON.description,
                            title: requestJSON.title
                        }
                    })
                    .promise();
                body = `Post book ${requestJSON.id}`;
                break;
            case "PUT /books/{id}":
                requestJSON = JSON.parse(event.body);
                await dynamo
                    .update({
                        TableName: "books",
                        Key: {
                            id: Number(event.pathParameters.id)
                        },
                        ExpressionAttributeNames: {
                            '#a': 'author',
                            '#d': "description",
                            '#t': "title"
                        },
                        UpdateExpression: 'SET #a = :a, #d = :d, #t = :t',
                        ExpressionAttributeValues: {
                            ':a': requestJSON.author,
                            ':d': requestJSON.description,
                            ':t': requestJSON.title,
                        }
                    })
                    .promise();
                body = `Put book ${event.pathParameters.id}`;
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