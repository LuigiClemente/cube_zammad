// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

type Data = {
  revalidated: boolean;
};

class TimestampCacheInvalidation {
  private lastUpdateTime: number = 0;
  private resetCounter: number = 0;
  private resetThreshold: number = 60 * 60 * 1000; // 60 minutes in milliseconds

  // Method to check if cache needs to be invalidated
  public shouldInvalidateCache(): boolean {
    const currentTime = Date.now();

    // Check if the reset threshold is reached
    if (currentTime - this.lastUpdateTime >= this.resetThreshold) {
      // Reset the counter and update the last update time
      this.resetCounter = 0;
      this.lastUpdateTime = currentTime;
      return false; // Cache does not need to be invalidated
    }

    // Increment the counter for each change
    this.resetCounter++;

    // Check if the counter reaches the threshold
    if (this.resetCounter >= 60) {
      // Reset the counter and update the last update time
      this.resetCounter = 0;
      this.lastUpdateTime = currentTime;
      return true; // Cache needs to be invalidated
    }

    return false; // Cache does not need to be invalidated
  }
}

const cacheInvalidation = new TimestampCacheInvalidation();

export async function POST(req: NextRequest) {
  // Get next tag needs invalidated
  const data = await req.json();
  const { tag } = data;

  if (cacheInvalidation.shouldInvalidateCache()) {
    // Cache invalidation
    console.log(
      "Cache should be invalidated. Implement cache invalidation logic here."
    );
    revalidateTag(tag as string);
    return NextResponse.json({ revalidated: true }, { status: 200 });
  } else {
    console.log("Cache does not need to be invalidated.");
    return NextResponse.json({ revalidated: false }, { status: 200 });
  }
}
