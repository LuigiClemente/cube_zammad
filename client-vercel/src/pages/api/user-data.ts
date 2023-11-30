// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { revalidateTag } from "next/cache";

const API_URL = "http://localhost:5000";

type Data = {
  User: any[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  console.log("Call user-data API");
  const response = await fetch(`${API_URL}/api/v1/user-data`);
  const json = await response.json();
  res.status(200).json(json);
}
