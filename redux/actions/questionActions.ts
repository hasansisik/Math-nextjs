import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { server } from "@/config";

// Types for payloads
export interface ExamPayload {
  title: string;
  questionsCount: number;
  questions: {
    question: string;
    options: string[];
    correctAnswer: string;
  }[];
}

export interface MatchingPayload {
  title: string;
  questionsCount: number;
  questions: {
    title: string;
    question: string[];
    correctAnswer: string[];
  }[];
}

export interface FractionPayload {
  title: string;
  questionsCount: number;
  questions: {
    title: string;
    question: {
      mixedFraction: string;
      parts?: {
        A?: string;
        B?: string;
        C?: string;
      };
      answer: string;
    }[];
  }[];
}

export interface PlacementPayload {
  title: string;
  questionsCount: number;
  questions: {
    type: '>' | '<';
    title: string;
    correctAnswer: number[];
    direction: string;
  }[];
}

// Get all questions
export const getQuestions = createAsyncThunk(
  "question/getAll",
  async (_, thunkAPI) => {
    try {
      const { data } = await axios.get(`${server}/question`);
      return data.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

// Exam actions
export const createExam = createAsyncThunk(
  "question/createExam",
  async (payload: ExamPayload, thunkAPI) => {
    try {
      const { data } = await axios.post(`${server}/question/exams`, payload);
      return data.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

export const updateExam = createAsyncThunk(
  "question/updateExam",
  async ({ id, payload }: { id: string; payload: ExamPayload }, thunkAPI) => {
    try {
      const { data } = await axios.put(`${server}/question/exams/${id}`, payload);
      return data.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

export const deleteExam = createAsyncThunk(
  "question/deleteExam",
  async (id: string, thunkAPI) => {
    try {
      await axios.delete(`${server}/question/exams/${id}`);
      return id;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

// Matching actions
export const createMatching = createAsyncThunk(
  "question/createMatching",
  async (payload: MatchingPayload, thunkAPI) => {
    try {
      const { data } = await axios.post(`${server}/question/matching`, payload);
      return data.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

export const updateMatching = createAsyncThunk(
  "question/updateMatching",
  async ({ id, payload }: { id: string; payload: MatchingPayload }, thunkAPI) => {
    try {
      const { data } = await axios.put(`${server}/question/matching/${id}`, payload);
      return data.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

export const deleteMatching = createAsyncThunk(
  "question/deleteMatching",
  async (id: string, thunkAPI) => {
    try {
      await axios.delete(`${server}/question/matching/${id}`);
      return id;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

// Fraction actions
export const createFraction = createAsyncThunk(
  "question/createFraction",
  async (payload: FractionPayload, thunkAPI) => {
    try {
      const { data } = await axios.post(`${server}/question/fraction`, payload);
      return data.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

export const updateFraction = createAsyncThunk(
  "question/updateFraction",
  async ({ id, payload }: { id: string; payload: FractionPayload }, thunkAPI) => {
    try {
      const { data } = await axios.put(`${server}/question/fraction/${id}`, payload);
      return data.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

export const deleteFraction = createAsyncThunk(
  "question/deleteFraction",
  async (id: string, thunkAPI) => {
    try {
      await axios.delete(`${server}/question/fraction/${id}`);
      return id;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

// Placement actions
export const createPlacement = createAsyncThunk(
  "question/createPlacement",
  async (payload: PlacementPayload, thunkAPI) => {
    try {
      const { data } = await axios.post(`${server}/question/placement`, payload);
      return data.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

export const updatePlacement = createAsyncThunk(
  "question/updatePlacement",
  async ({ id, payload }: { id: string; payload: PlacementPayload }, thunkAPI) => {
    try {
      const { data } = await axios.put(`${server}/question/placement/${id}`, payload);
      return data.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

export const deletePlacement = createAsyncThunk(
  "question/deletePlacement",
  async (id: string, thunkAPI) => {
    try {
      await axios.delete(`${server}/question/placement/${id}`);
      return id;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);
