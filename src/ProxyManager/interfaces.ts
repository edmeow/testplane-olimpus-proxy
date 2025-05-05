export interface Result {
  id: any;
  title: string;
  pass: boolean;
  message?: string;
}

export interface Solution {
  id: number;
  type: "project" | "single-file";
  state: "pending" | "resolved";
  results: Result[];
}
