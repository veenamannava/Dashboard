import {createSlice} from '@reduxjs/toolkit';
const initialState={
  Model:"",
  Scratches:"",
  ForeignParticles:"",
  Discolortion:"",
  Others:"",
  Sno:"",
  Crack:"",
  Chipping:"",
  Bottle_Cap:"",
};
const SystemSlice = createSlice({
    name:"systemdata",
    initialState,  
reducers:{
    Systemdata:(state, action) => {
        return {
          Model: action.payload.Model,
          Scratches:action.payload.Scratches,
          ForeignParticles:action.payload.ForeignParticles,
          Discoloration:action.payload.Discoloration,
          Others:action.payload.Others,
          Crack:action.payload.Crack,
          Chipping:action.payload.Chipping,
          Bottle_Cap:action.payload.Bottle_Cap,
          Sno:action.payload.Sno
        }; 
    }
}
})
export const {Systemdata} = SystemSlice.actions; 
export default SystemSlice.reducer;