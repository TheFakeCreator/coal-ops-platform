import { NextResponse } from "next/server";
import { getSnowflakeConnection, executeQuery } from "@/lib/snowflake";

export async function GET() {
  const startTime = Date.now();

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
    console.error("[API /data] Error:", message);

    return NextResponse.json(
      {
        error: message,
        meta: {
          fetchedAt: new Date().toISOString(),
          queryTimeMs: Date.now() - startTime,
        },
      },
      { status: 500 }
    );
  }
}
