const AWS = require("aws-sdk");
const db = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME || "";
const PRIMARY_KEY = process.env.PRIMARY_KEY || "";
export const handler = async (event: any = {}): Promise<any> => {
  const ID =
    typeof event.body === "object"
      ? event.body[PRIMARY_KEY]
      : JSON.parse(event.body)[PRIMARY_KEY];

  const params = {
    TableName: TABLE_NAME,
    Key: {
      [PRIMARY_KEY]: ID,
    },
  };

  try {
    await db.delete(params).promise();
    return { statusCode: 200, body: "success" };
  } catch (dbError) {
    return { statusCode: 500, body: JSON.stringify(dbError) };
  }
};
