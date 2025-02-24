import axios from 'axios';
import Paths from '@/config/path';
import { createAsyncThunk } from '@reduxjs/toolkit';

type PromptParamType =
  | {
      query: string | any;
      price?: string;
      condition?: string;
      userId?: string;
      barcode?: string;
    }
  | any;

export const getSliderThunk = createAsyncThunk('homepage/slider', async () => {
  try {
    const path = `${Paths.SLIDER}`;

    const res = await axios.get(path);

    const data: any = res.data;
    return data;
  } catch (e: any) {
    if ((e instanceof Error) as any) {
      throw new Error(e?.response?.data?.message);
    }
  }
});

export const getCategoryThunk = createAsyncThunk(
  'homepage/category',
  async () => {
    try {
      const path = `${Paths.CATEGORY}`;

      const res = await axios.get(path);

      const data: any = res.data;
      return data;
    } catch (e: any) {
      if ((e instanceof Error) as any) {
        throw new Error(e?.response?.data?.message);
      }
    }
  }
);

export const getSubCategoryThunk = createAsyncThunk(
  'homepage/sub-category',
  async () => {
    try {
      const path = `${Paths.SUB_CATEGORY}`;

      const res = await axios.get(path);

      const data: any = res.data;
      return data;
    } catch (e: any) {
      if ((e instanceof Error) as any) {
        throw new Error(e?.response?.data?.message);
      }
    }
  }
);
