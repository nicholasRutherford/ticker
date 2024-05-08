"use client";
import { Link } from "@nextui-org/link";
import { Snippet } from "@nextui-org/snippet";
import { Code } from "@nextui-org/code";
import { button as buttonStyles } from "@nextui-org/theme";
import { siteConfig } from "@/config/site";
import { title, subtitle } from "@/components/primitives";
import { GithubIcon } from "@/components/icons";
import { Textarea } from "@nextui-org/react";
import { Button, ButtonGroup } from "@nextui-org/react";
import { useState, useEffect } from "react";
import { ThemeSwitch } from "@/components/theme-switch";
import StockTicker from "@/components/stock-ticker";

export const getStonkPriceAtProb = (prob: number) => {
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

export default function ViewPage() {
  const [marketSlugs, setMarketSlugs] = useState<string[]>([]);
  const [marketData, setMarketData] = useState<any[]>([]);
  const [transformedData, setTransformedData] = useState<any[]>([]);

  useEffect(() => {
    // Load market slugs from local storage on component mount
    const savedMarketSlugs = localStorage.getItem("marketSlugs");
    if (savedMarketSlugs) {
      setMarketSlugs(JSON.parse(savedMarketSlugs));
    }
  }, []);

  useEffect(() => {
    const fetchMarketData = async () => {
      const data = await Promise.all(
        marketSlugs.map((slug) => getManifoldData(slug))
      );
      setMarketData(data);
    };

    if (marketSlugs.length > 0) {
      fetchMarketData();
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
    </div>
  );
}
