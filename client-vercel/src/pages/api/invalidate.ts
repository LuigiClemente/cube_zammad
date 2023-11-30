// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { revalidateTag } from "next/cache";

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

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  // Get next tag needs invalidated
  const { tag } = req.body;

  if (cacheInvalidation.shouldInvalidateCache()) {
    // Cache invalidation
    console.log(
      "Cache should be invalidated. Implement cache invalidation logic here."
    );
    revalidateTag(tag as string);
    res.status(200).json({ revalidated: true });
  } else {
    console.log("Cache does not need to be invalidated.");
    res.status(200).json({ revalidated: false });
  }
}
