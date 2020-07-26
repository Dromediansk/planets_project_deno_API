import * as log from "https://deno.land/std/log/mod.ts";
import flatMap from "https://deno.land/x/lodash/flatMap.js";

interface Launch {
  flightNumber: number;
  mission: string;
  rocket: string;
  customers: Array<string>;
  launchDate: number;
  upcoming: boolean;
  success?: boolean;
  target?: string;
}

const launches = new Map<number, Launch>();

async function downloadLaunchData() {
  log.info("Downloading launch data...");
  const response = await fetch("https://api.spacexdata.com/v3/launches", {
    method: "GET",
  });

  if (!response.ok) {
    log.warning("Problem downloading launch data.");
    throw new Error("Launch data download failed.");
  }

  const launchData = await response.json();
  for (const launch of launchData) {
    const payloads = launch.rocket.second_stage.payloads;
    const customers = flatMap(payloads, (payload: any) => payload.customers);

    const flightData = {
      flightNumber: launch.flight_number,
      mission: launch.mission_name,
      rocket: launch.rocket.rocket_name,
      launchDate: launch.launch_date_unix,
      upcoming: launch.upcoming,
      success: launch.launch_success,
      customers: customers,
    };

    launches.set(flightData.flightNumber, flightData);
  }
}

await downloadLaunchData();
log.info(`Downloaded data for ${launches.size} SpaceX launches.`);

export function getAllLaunches() {
  return Array.from(launches.values());
}

export function getLaunchById(launchId: number) {
  if (launches.has(launchId)) {
    return launches.get(launchId);
  }
  return null;
}

export function addLaunch(launchData: Launch) {
  launches.set(
    launchData.flightNumber,
    Object.assign(launchData, {
      upcoming: true,
      customers: ["Zero to Mastery, NASA"],
    }),
  );
}
