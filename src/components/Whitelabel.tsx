"use client";

import { useEffect, useRef, useState } from "react";
import {
  initSilk,
  SilkEthereumProviderInterface,
} from "@silk-wallet/silk-wallet-sdk";
import {
  AuthenticationMethod,
  SocialProvider,
} from "@silk-wallet/silk-interface-core";

interface WhitelabelProps {
  config?: {
    styles?: {
      darkMode?: boolean;
    };
    allowedSocials?: SocialProvider[];
    authenticationMethods?: AuthenticationMethod[];
  };
  className?: string;
}

export default function Whitelabel({ className = "" }: WhitelabelProps) {
  const [silkProvider, setSilkProvider] =
    useState<SilkEthereumProviderInterface | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize Silk with preview mode
    const provider = initSilk({
      // containerElement: containerRef.current
      //   config: {
      //     styles: {
      //       darkMode: config?.styles?.darkMode
      //     },
      //     allowedSocials: config?.allowedSocials,
      //     authenticationMethods: config?.authenticationMethods
      //   }
    });

    console.log("provider", provider);

    setSilkProvider(provider);

    // return () => {
    //   // Cleanup if needed
    //   if (silkProvider) {
    //     // Add any cleanup logic here
    //   }
    // }
  }, []);

  const handleLogin = () => {
    silkProvider?.login();
  };

  return (
    <div className="space-y-4 h-[1000px]">
      <button
        onClick={handleLogin}
        className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
      >
        Show Preview
      </button>
      <div
        ref={containerRef}
        className={`relative bg-transparent h-full ${className}`}
      />
    </div>
  );
}
