import { NextResponse } from "next/server";
import { getSnowflakeConnection, executeQuery } from "@/lib/snowflake";
import mockData from "@/data/mockData.json";

export async function GET() {
  const startTime = Date.now();

  // 1. Explicit Mock Mode Check
  if (process.env.USE_MOCK_DATA === "true") {
    return NextResponse.json(mockData, {
      headers: { "Cache-Control": "private, max-age=30" },
    });
  }

  try {
    const conn = await getSnowflakeConnection();

    const [production, haulage] = await Promise.all([
      executeQuery(conn, "SELECT * FROM FCT_DAILY_PRODUCTION"),
      executeQuery(conn, "SELECT * FROM FCT_HAULAGE_ANALYTICS"),
    ]);

    const queryTimeMs = Date.now() - startTime;

    return NextResponse.json(
      {
        production,
        haulage,
        meta: {
          fetchedAt: new Date().toISOString(),
          productionCount: production.length,
          haulageCount: haulage.length,
          queryTimeMs,
          isMock: false
        },
      },
      {
        headers: {
          "Cache-Control": "private, max-age=30",
        },
      }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    
    console.warn("[API /data] Snowflake connection failed, falling back to mock data:", message);

    // 2. Automatic Fallback on Failure (e.g. trial expired)
    return NextResponse.json(mockData, {
      headers: { "Cache-Control": "private, max-age=30" },
    });
  }
}
