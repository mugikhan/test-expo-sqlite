import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/useColorScheme";
import * as SQLite from "expo-sqlite";
import type { SQLiteDatabase } from "expo-sqlite";
import { numberName, randomIntFromInterval } from "@/utils/utils";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  async function test1(db: SQLiteDatabase) {
    await db.withTransactionAsync(async () => {
      for (let i = 0; i < 1000; i++) {
        const n = randomIntFromInterval(0, 100000);
        await db.runAsync("INSERT INTO t1(a, b, c) VALUES(?, ?, ?)", [
          i + 1,
          n,
          numberName(n),
        ]);
        if (i % 100 === 0) {
          console.log(`test1: i = ${i}`);
        }
      }
    });
    await db.runAsync("PRAGMA wal_checkpoint(RESTART)");
  }

  async function test2(db: SQLiteDatabase) {
    await db.withTransactionAsync(async () => {
      for (let i = 0; i < 25000; ++i) {
        const n = randomIntFromInterval(0, 100000);
        await db.runAsync(`INSERT INTO t2(a, b, c) VALUES(?, ?, ?)`, [
          i + 1,
          n,
          numberName(n),
        ]);
        if (i % 100 === 0) {
          console.log(`test2: i = ${i}`);
        }
      }
    });
    await db.runAsync("PRAGMA wal_checkpoint(RESTART)");
  }

  async function testAsync() {
    console.log("Starting testAsync");

    const db = await SQLite.openDatabaseAsync("test.db");

    await db.runAsync("DROP TABLE IF EXISTS t1");
    await db.runAsync("DROP TABLE IF EXISTS t2");
    await db.runAsync(
      "CREATE TABLE t1(id INTEGER PRIMARY KEY, a INTEGER, b INTEGER, c TEXT)"
    );
    await db.runAsync(
      "CREATE TABLE t2(id INTEGER PRIMARY KEY, a INTEGER, b INTEGER, c TEXT)"
    );
    await test1(db);
    await test2(db);

    console.log("Finishing testAsync");
  }

  useEffect(() => {
    SplashScreen.hideAsync();

    testAsync().then(() => console.log("DONE"));
  });

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </ThemeProvider>
  );
}
