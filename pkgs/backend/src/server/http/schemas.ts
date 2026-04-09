import { z } from "zod";

export const initDataSchema = z.object({
  initData: z.string().min(1),
});
