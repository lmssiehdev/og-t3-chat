"use client";
import dynamic from "next/dynamic";

export default dynamic(() => import("./_client-page"), {
	ssr: false,
});
