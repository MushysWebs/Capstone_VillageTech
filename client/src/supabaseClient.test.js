import { createClient } from "@supabase/supabase-js";
import supabase from "./supabaseClient";

jest.mock("@supabase/supabase-js");

describe("supabaseClient", () => {

  test("exports the initialized Supabase client", () => {
    expect(supabase).toBeDefined();
  });
});
