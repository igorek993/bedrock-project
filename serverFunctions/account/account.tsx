"use server";

import { v4 as uuidv4 } from "uuid"; // Import UUID generation

interface UserData {
  id: number;
  up: number;
  down: number;
  total: number;
  remark: string; // User's email address
  enable: boolean;
  expiryTime: number;
  listen: string;
  port: number;
  protocol: string;
  settings: string;
  streamSettings: string;
  tag: string;
  sniffing: string;
}

export async function getVmessString(email: string) {
  const users_list = await listUsers();
  const user_data = findUser(users_list, email);
  if (user_data) {
    return constructVmessBase64String(user_data);
  } else {
    return;
  }
}

async function listUsers() {
  try {
    const response = await fetch("http://109.61.16.17:54321/xui/inbound/list", {
      method: "POST",
      headers: {
        Accept: "application/json, text/plain, */*",
        "X-Requested-With": "XMLHttpRequest",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.50 Safari/537.36",
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        Origin: "http://109.61.16.17:54321",
        Referer: "http://109.61.16.17:54321/xui/inbounds",
        "Accept-Encoding": "gzip, deflate",
        "Accept-Language": "en-GB,en-US;q=0.9,en;q=0.8",
        Cookie: `session=${process.env.CONSOLE_COOKIE}`,
        Connection: "close",
      },
      body: "", // Empty body with Content-Length set to 0
    });

    const users_list = await response.json();

    // console.log("Response Data:", users_list);
    return users_list.obj;
  } catch (error) {
    console.error("Error fetching user list:", error);
    throw error;
  }
}

function findUser(users_list: UserData[], email: string) {
  return users_list.find((user) => user.remark === email) || "";
}

function constructVmessBase64String(user_data: UserData) {
  const userInfo = {
    v: "2",
    ps: user_data.remark, // User's email address
    add: user_data.listen || "109.61.16.17", // Replace with the user's address or default value
    port: user_data.port,
    id: JSON.parse(user_data.settings).clients[0].id, // Extracting the client ID from settings
    aid: 0, // Static value as per your requirement
    net: JSON.parse(user_data.streamSettings).network, // Extract network type from streamSettings
    type: "none", // Static value as per your requirement
    host: "", // Static value as per your requirement
    path: JSON.parse(user_data.streamSettings).wsSettings.path, // Extracting the path from streamSettings
    tls: "none", // Static value as per your requirement
  };

  const jsonString = JSON.stringify(userInfo);
  const base64String = Buffer.from(jsonString).toString("base64");
  return `vmess://${base64String}`;
}

export async function createUser(email: string) {
  const usersList = await listUsers();
  const portNumber = findAvailablePort(usersList);

  // Prepare the request payload
  const requestData: Record<string, string> = {
    up: "0", // Convert to string
    down: "0", // Convert to string
    total: "0", // Convert to string
    remark: email,
    enable: "true", // Convert to string
    expiryTime: "0", // Convert to string
    listen: "",
    port: portNumber ? portNumber.toString() : "", // Convert to string or empty string
    protocol: "vmess",
    settings: JSON.stringify({
      clients: [
        {
          id: uuidv4(), // Generate a unique ID for the client
          alterId: 0,
        },
      ],
      disableInsecureEncryption: false,
    }),
    streamSettings: JSON.stringify({
      network: "ws",
      security: "none",
      wsSettings: {
        path: "/home",
        headers: {},
      },
    }),
    sniffing: JSON.stringify({
      enabled: false,
      destOverride: ["http", "tls"],
    }),
  };

  // URL-encode the data
  const urlEncodedData = new URLSearchParams(requestData).toString();

  // Sending the POST request
  const response = await fetch("http://109.61.16.17:54321/xui/inbound/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      "X-Requested-With": "XMLHttpRequest",
      Cookie: `session=${process.env.CONSOLE_COOKIE}`,
    },
    body: urlEncodedData,
  });

  if (!response.ok) {
    throw new Error(`Error creating user: ${response.statusText}`);
  }

  const result = await response.json(); // If the response is JSON
  console.log(result);
  return result; // Return the result of the API call
}

function findAvailablePort(users_list: UserData[]) {
  const startPort = 25000;
  const endPort = 25100;

  // Create a set of used ports from the users_list
  const usedPorts = new Set(users_list.map((user) => user.port));

  // Iterate through the port range to find the first available port
  for (let port = startPort; port <= endPort; port++) {
    if (!usedPorts.has(port)) {
      return port; // Return the first available port
    }
  }

  return null; // Return null if no ports are available
}
