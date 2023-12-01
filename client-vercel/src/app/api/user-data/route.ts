// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { NextRequest, NextResponse } from "next/server";

const API_URL = "https://snapper-fit-snipe.ngrok-free.app";

type Data = {
  User: any[];
};

export async function GET(req: NextRequest) {
  console.log("Call user-data API");
  const response = await fetch(`${API_URL}/api/v1/user-data`);
  const json = await response.json();
  return NextResponse.json(json, { status: 200 });
}
