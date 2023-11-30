import { useEffect, useState } from "react";

export default function Home() {
  const [data, setData] = useState({});
  useEffect(() => {
    (async () => {
      // Fetch user data API
      const res = await fetch("/api/user-data", {
        // Define time-based revalidate
        next: {
          tags: ["user-data"],
          revalidate: 3600,
        },
      });
      const json = await res.json();
      setData(json);
    })();
  }, []);

  return <>{JSON.stringify(data)}</>;
}
