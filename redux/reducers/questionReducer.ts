import { createReducer } from "@reduxjs/toolkit";
import {
  getQuestions,
  createExam,
  updateExam,
  deleteExam,
  createMatching,
  updateMatching,
  deleteMatching,
  createFraction,
  updateFraction,
  deleteFraction,
  createPlacement,
  updatePlacement,
  deletePlacement,
  createSpace,
  updateSpace,
  deleteSpace,
} from "../actions/questionActions";

interface QuestionState {
  questions: any[];
  currentQuestion: any;
  loading: boolean;
  error: string | null;
  message?: string;
}

const initialState: QuestionState = {
  questions: [],
  currentQuestion: null,
  loading: false,
  error: null,
};

export const questionReducer = createReducer(initialState, (builder) => {
  builder
    // Get All Questions
    .addCase(getQuestions.pending, (state) => {
      state.loading = true;
    })
    .addCase(getQuestions.fulfilled, (state, action) => {
      state.loading = false;
      state.questions = action.payload;
    })
    .addCase(getQuestions.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })

    // Exam Cases
    .addCase(createExam.pending, (state) => {
      state.loading = true;
    })
    .addCase(createExam.fulfilled, (state, action) => {
      state.loading = false;
      state.questions.push(action.payload);
      state.message = "Exam created successfully";
    })
    .addCase(createExam.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })

    .addCase(updateExam.pending, (state) => {
      state.loading = true;
    })
    .addCase(updateExam.fulfilled, (state, action) => {
      state.loading = false;
      state.questions = state.questions.map(question =>
        question._id === action.payload._id ? action.payload : question
      );
      state.message = "Exam updated successfully";
    })
    .addCase(updateExam.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })

    .addCase(deleteExam.pending, (state) => {
      state.loading = true;
    })
    .addCase(deleteExam.fulfilled, (state, action) => {
      state.loading = false;
      state.questions = state.questions.filter(question => question._id !== action.payload);
      state.message = "Exam deleted successfully";
    })
    .addCase(deleteExam.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })

    // Matching Cases
    .addCase(createMatching.pending, (state) => {
      state.loading = true;
    })
    .addCase(createMatching.fulfilled, (state, action) => {
      state.loading = false;
      state.questions.push(action.payload);
      state.message = "Matching question created successfully";
    })
    .addCase(createMatching.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })

    .addCase(updateMatching.pending, (state) => {
      state.loading = true;
    })
    .addCase(updateMatching.fulfilled, (state, action) => {
      state.loading = false;
      state.questions = state.questions.map(question =>
        question._id === action.payload._id ? action.payload : question
      );
      state.message = "Matching question updated successfully";
    })
    .addCase(updateMatching.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })

    .addCase(deleteMatching.pending, (state) => {
      state.loading = true;
    })
    .addCase(deleteMatching.fulfilled, (state, action) => {
      state.loading = false;
      state.questions = state.questions.filter(question => question._id !== action.payload);
      state.message = "Matching question deleted successfully";
    })
    .addCase(deleteMatching.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })

    // Fraction Cases
    .addCase(createFraction.pending, (state) => {
      state.loading = true;
    })
    .addCase(createFraction.fulfilled, (state, action) => {
      state.loading = false;
      state.questions.push(action.payload);
      state.message = "Fraction question created successfully";
    })
    .addCase(createFraction.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })

    .addCase(updateFraction.pending, (state) => {
      state.loading = true;
    })
    .addCase(updateFraction.fulfilled, (state, action) => {
      state.loading = false;
      state.questions = state.questions.map(question =>
        question._id === action.payload._id ? action.payload : question
      );
      state.message = "Fraction question updated successfully";
    })
    .addCase(updateFraction.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })

    .addCase(deleteFraction.pending, (state) => {
      state.loading = true;
    })
    .addCase(deleteFraction.fulfilled, (state, action) => {
      state.loading = false;
      state.questions = state.questions.filter(question => question._id !== action.payload);
      state.message = "Fraction question deleted successfully";
    })
    .addCase(deleteFraction.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })

    // Placement Cases
    .addCase(createPlacement.pending, (state) => {
      state.loading = true;
    })
    .addCase(createPlacement.fulfilled, (state, action) => {
      state.loading = false;
      state.questions.push(action.payload);
      state.message = "Placement question created successfully";
    })
    .addCase(createPlacement.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })

    .addCase(updatePlacement.pending, (state) => {
      state.loading = true;
    })
    .addCase(updatePlacement.fulfilled, (state, action) => {
      state.loading = false;
      state.questions = state.questions.map(question =>
        question._id === action.payload._id ? action.payload : question
      );
      state.message = "Placement question updated successfully";
    })
    .addCase(updatePlacement.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })

    .addCase(deletePlacement.pending, (state) => {
      state.loading = true;
    })
    .addCase(deletePlacement.fulfilled, (state, action) => {
      state.loading = false;
      state.questions = state.questions.filter(question => question._id !== action.payload);
      state.message = "Placement question deleted successfully";
    })
    .addCase(deletePlacement.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })

    // Space Cases
    .addCase(createSpace.pending, (state) => {
      state.loading = true;
    })
    .addCase(createSpace.fulfilled, (state, action) => {
      state.loading = false;
      state.questions.push(action.payload);
      state.message = "Space question created successfully";
    })
    .addCase(createSpace.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })

    .addCase(updateSpace.pending, (state) => {
      state.loading = true;
    })
    .addCase(updateSpace.fulfilled, (state, action) => {
      state.loading = false;
      state.questions = state.questions.map(question =>
        question._id === action.payload._id ? action.payload : question
      );
      state.message = "Space question updated successfully";
    })
    .addCase(updateSpace.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })

    .addCase(deleteSpace.pending, (state) => {
      state.loading = true;
    })
    .addCase(deleteSpace.fulfilled, (state, action) => {
      state.loading = false;
      state.questions = state.questions.filter(question => question._id !== action.payload);
      state.message = "Space question deleted successfully";
    })
    .addCase(deleteSpace.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
});
