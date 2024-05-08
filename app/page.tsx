"use client";

import { Textarea } from "@nextui-org/react";
import { useState, useEffect } from "react";
import { ThemeSwitch } from "@/components/theme-switch";
import StockTicker from "@/components/stock-ticker";

const getStonkPriceAtProb = (prob: number) => {
  const cappedProb = Math.min(Math.max(prob, 0.0001), 0.9999);
  const logTerm = Math.log(cappedProb / (1 - cappedProb));
  const maxTerm = Math.max(logTerm, cappedProb);
  const stonkPrice = maxTerm * 500;
  return stonkPrice;
};

const getPrice = (marketData: any) => {
  switch (marketData.outcomeType) {
    case "BINARY":
      return `${(marketData.probability * 100).toFixed(2)}%`;
    case "STONK":
      return getStonkPriceAtProb(marketData.p).toFixed(2);
    default:
      "meow";
  }
};

const getManifoldData = async (slug: string) => {
  const response = await fetch(`https://api.manifold.markets/v0/slug/${slug}`);
  return response.json();
};

const parseMarketText = (marketText: string): string[] => {
  const urlRegex = /(?:https?:\/\/)?manifold\.markets\/(\w+)\/([^?/]+)/;

  return marketText
    .split(",")
    .map((url) => url.trim())
    .filter((url) => urlRegex.test(url))
    .map((url) => {
      const match = url.match(urlRegex);
      if (match) {
        return match[2];
      }
      return "";
    })
    .filter((slug) => slug !== "");
};

export default function Home() {
  const [marketText, setMarketText] = useState<string>("");
  const [marketSlugs, setMarketSlugs] = useState<string[]>([]);
  const [marketData, setMarketData] = useState<any[]>([]);
  const [transformedData, setTransformedData] = useState<any[]>([]);

  useEffect(() => {
    // Load market slugs from local storage on component mount
    const savedMarketSlugs = localStorage.getItem("marketSlugs");
    const savedMarketText = localStorage.getItem("marketText");
    if (savedMarketSlugs && savedMarketText) {
      setMarketSlugs(JSON.parse(savedMarketSlugs));
      setMarketText(JSON.parse(savedMarketText));
    }
  }, []);

  useEffect(() => {
    if (marketText !== "") {
      const parsedSlugs = parseMarketText(marketText);
      setMarketSlugs(parsedSlugs);
      localStorage.setItem("marketSlugs", JSON.stringify(parsedSlugs));
      localStorage.setItem("marketText", JSON.stringify(marketText));
    }
  }, [marketText]);

  useEffect(() => {
    const fetchMarketData = async () => {
      const data = await Promise.all(
        marketSlugs.map((slug) => getManifoldData(slug))
      );
      setMarketData(data);
    };

    if (marketSlugs.length > 0) {
      fetchMarketData();

      // Set up interval to re-fetch market data every 10 seconds
      const interval = setInterval(fetchMarketData, 10000);

      // Clean up the interval on component unmount
      return () => {
        clearInterval(interval);
      };
    }
  }, [marketSlugs]);

  useEffect(() => {
    if (marketData.length > 0) {
      setTransformedData(
        marketData.map((data) => ({
          question: data.question,
          price: getPrice(data),
        }))
      );
    }
  }, [marketData]);

  return (
    <div>
      <StockTicker marketData={transformedData} speed={30} />

      <div className="mt-6">
        <ThemeSwitch />

        <Textarea
          label="Manifold Markets"
          description="CSV separated list of manifold market urls"
          placeholder="https://manifold.markets/strutheo/will-the-11foot88-bridge-claim-a-fo,https://manifold.markets/SG/manifold-stock-permanent"
          className="max-w-lg"
          minRows={10}
          value={marketText}
          onValueChange={setMarketText}
        />
      </div>
    </div>
  );
}
