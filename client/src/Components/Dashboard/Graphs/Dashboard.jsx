import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
//getting charts from their respective path for rendering graphs in one component
import DynamicChart from "./DynamicChart";
import PieChart from "./PieChart";
import LineChart from "./LineChart";
import axios from "axios";
///////////////////////////////////////////////////////

//getting defectlog table for displaying defectlog table
import DefectsTable from "../Defectlog/DefectLog";
//

//getting mui styles required for the project
import {
  FormGroup,
  Checkbox,
  Paper,
  FormControlLabel,
  Button,
  TextField,
  Grid,
} from "@mui/material";
import Multiselect from "multiselect-react-dropdown";
import { DatePicker } from "@mui/lab";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import LocalizationProvider from "@mui/lab/LocalizationProvider";
import { filterHandler } from "../../../reducers/filter/filterSlice";
import { defectSettingHandler } from "../../../reducers/DatesettingSlice";
import "./Dashboard.modules.css";
import { makeStyles } from "@material-ui/core/styles";
import { NONAME } from "dns";
//////////////////////////////////////////////////////////////////////////

const useStyles = makeStyles((theme) => ({
 yellowPaper: {
  marginLeft:"12px",
  marginRight:'12px'
  },
}));


function Dashboard() {
  const classes = useStyles();

  const filterConditions = useSelector((state) => state.filter);
  const [tab, settab] = useState(true);
  const x = new Date();
  function pad2(n) {
    return (n < 10 ? "0" : "") + n;
  }

  let givenDate = `${x.getFullYear()}-${pad2(x.getMonth() + 1)}-${pad2(x.getDate())}`;
  const [value, setValue] = useState({ fromd: givenDate, tod: givenDate });
  const [checkStates, setCheckStates] = useState([
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,

  ]);
  const [checkedValues, setCheckedValues] = useState({
    fromDate: givenDate,
    toDate: givenDate,
    Aqua: checkStates[0],
    // Zero: checkStates[1],
    Oasis: checkStates[2],
    OtherBrands:checkStates[3],
    Scratches: false,
    Discoloration: false,
    "Foreign Particles": false,
    Others: false,
    // Crack:false,
    "Good Bottle":false,
    "Bottle Cap":false,
    
    All: false,
  });

  

  const dispatch = useDispatch();

  const [table, setTable] = useState(true);

  const [sfrom, setsfrom] = useState();
  const [sdefect, setsdefect] = useState([]);

  const [disable, SetDisableButton] = useState(false);
  const applyFilterHandler = (e) => {
    if (sfrom < new Date().getMonth() - 3) {
        alert("Data beyond 120 days can't be retrieved. Please select accordingly.");
      } else {
    if(checkStates[0]==true||checkStates[1]==true||checkStates[2]==true||checkStates[3]==true||sdefect){
    SetDisableButton((prev) => !prev);
    dispatch(filterHandler({ ...checkedValues }));
    console.log(filterConditions);
    axios.post("/data/filter", checkedValues).then((res) => {
      console.log("here");
      console.log(res.data);
      dispatch(
        defectSettingHandler({
          typeA: res.data[0],
          typeB: res.data[1],
          typeC: res.data[2],
          typeD: res.data[3],
          typeE: res.data[4],
          typeF: res.data[5],
          typeG: res.data[6],
        })
      );
      SetDisableButton((prev) => !prev);
    });
  }
  else{
    alert("Please select atleast one check box")
  }
}
  };
  
  
  useEffect(() => {
    dispatch(filterHandler({ ...checkedValues }));
    axios.post("/data/filter", {...checkedValues,fromDate:`${x.getFullYear()}-${pad2(x.getMonth() + 1)}-${pad2(x.getDate())}`,toDate:`${x.getFullYear()}-${pad2(x.getMonth()+1)}-${pad2(x.getDate())}`}).then((res) => {
      console.log("here");
      console.log(res.data);
      dispatch(
        defectSettingHandler({
          typeA: res.data[0],
          typeB: res.data[1],
          typeC: res.data[2],
          typeD: res.data[3],
          typeE: res.data[4],
          typeF: res.data[5],
          typeG: res.data[6],

        })
      );
    });
  },[]);

// below is for drop down functionality
const selectdefect = (option) => {
  setsdefect((prev) => [...option]);
  // setabc(option);
};
const removedefect = (option) => {
  setsdefect((prev) => [...option]);

  if (option.includes("All")) {
    setCheckedValues((prev) => {
      return { ...prev, Discoloration: true,Scratches: true,"Good Bottle": true,"Foreign Particles": true,"Bottle Cap": true, Others: true };
    });
  
  }else{
  if (option.includes("Discoloration")) {
    setCheckedValues((prev) => {
      return { ...prev, Discoloration: true };
    });
  } else {
    setCheckedValues((prev) => {
      return { ...prev, Discoloration: false };
    });
  }
  if (option.includes("Scratches")) {
    setCheckedValues((prev) => {
      return { ...prev, Scratches: true };
    });
  } else {
    setCheckedValues((prev) => {
      return { ...prev, Scratches: false };
    });
  }
  if (option.includes("Foreign Particles")) {
    setCheckedValues((prev) => {
      return { ...prev, "Foreign Particles": true };
    });
  } else {
    setCheckedValues((prev) => {
      return { ...prev, "Foreign Particles": false };
    });
  }
  if (option.includes("Good Bottle")) {
    setCheckedValues((prev) => {
      return { ...prev, "Good Bottle": true };
    });
  } else {
    setCheckedValues((prev) => {
      return { ...prev, "Good Bottle": false };
    });
  }
  if (option.includes("Bottle Cap")) {
    setCheckedValues((prev) => {
      return { ...prev, "Bottle Cap": true };
    });
  } else {
    setCheckedValues((prev) => {
      return { ...prev, "Bottle Cap": false };
    });
  }

  if (option.includes("Others")) {
    setCheckedValues((prev) => {
      return { ...prev, Others: true };
    });
  } else {
    setCheckedValues((prev) => {
      return { ...prev, Others: false };
    });
  }}
};
// above is for drop down functionality

  return (
    <Grid container xs={12}>
        <Grid XS={12}>
<h1>Dashboard</h1>
</Grid>
      <Grid xs={12}>
        <Paper elevation={3} className={classes.yellowPaper}>
      <Grid xs={4}>
          <div>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
               className="dtpicker"    
               
                 label="From Date" 
                value={value.fromd}
                sx={{ backgroundColor: "black", marginTop: "20px"}}
                onChange={(value) => {
                  setValue((prev) => {
                    return { ...prev, fromd: value };
                  });
                  setsfrom(value.getMonth());
                  setCheckedValues({
                    ...checkedValues,
                    fromDate: `${value.getFullYear()}-${pad2(
                      value.getMonth() + 1)
                    }-${pad2(value.getDate())}`,
                  });
                  setValue((prev) => {
                    return {
                      fromd: `${value.getFullYear()}-${pad2(
                        value.getMonth() + 1)
                      }-${pad2(value.getDate())}`,
                      ...prev,
                    };
                  });
                }}
                renderInput={(params) => <TextField  className="defect-input" variant="outlined"
                id="outlined-basic" {...params} />}
              />
              <DatePicker
              
                label="To Date"
                value={value.tod}
                className="dtpicker"
                onChange={(value) => {
                  setValue((prev) => {
                    return { ...prev, tod: value };
                  });
                  setCheckedValues({
                    ...checkedValues,
                    toDate: `${value.getFullYear()}-${pad2(
                      value.getMonth() + 1)
                    }-${pad2(value.getDate())}`,
                  });
                  setValue((prev) => {
                    return {
                      tod: `${value.getFullYear()}-${pad2(
                        value.getMonth() + 1)
                      }-${value.getDate()}`,
                      ...prev,
                    };
                  });
                }}
                renderInput={(params) => <TextField  className="defect-input" variant="outlined"
                id="outlined-basic"
                 {...params} />}
              />
            </LocalizationProvider>
          </div>
          </Grid>
          <Grid xs={3}>
          <FormGroup className="checks">
            Bottle Types
            <div>
              <FormControlLabel
                control={<Checkbox />}
                label="Aqua"
                onChange={(e) => {
                  setCheckedValues((prev) => {
                    return { ...prev, Aqua: !prev.Aqua };
                  });
                  setCheckStates((prev) => {
                    let x = [...prev];
                    x[0] = !x[0];
                    return [...x];
                  });
                }}
                checked={checkStates[0]}
              />
              {/* <FormControlLabel
                control={<Checkbox />}
                label="Zero"
                onChange={(e) => {
                  setCheckedValues((prev) => {
                    return { ...prev, Zero: !prev.Zero };
                  });
                  setCheckStates((prev) => {
                    let x = [...prev];
                    x[1] = !x[1];
                    return [...x];
                  });
                }}
                checked={checkStates[1]}
              /> */}

<FormControlLabel
                control={<Checkbox />}
                label="Oasis"
                onChange={(e) => {
                  setCheckedValues((prev) => {
                    return { ...prev, Oasis: !prev.Oasis };
                  });
                  setCheckStates((prev) => {
                    let x = [...prev];
                    x[2] = !x[2];
                    return [...x];
                  });
                }}
                checked={checkStates[2]}
              />
              <FormControlLabel
                control={<Checkbox />}
                label="Other Brands"
                onChange={(e) => {
                  setCheckedValues((prev) => {
                    return { ...prev, OtherBrands: !prev.OtherBrands };
                  });
                  setCheckStates((prev) => {
                    let x = [...prev];
                    x[3] = !x[3];
                    return [...x];
                  });
                }}
                checked={checkStates[3]}
              />
            </div>
          </FormGroup>
          </Grid>
          {/* check boxes below */}
          {/* <FormGroup className="checks">
            <span> Defect Types</span>
            <div>
              <FormControlLabel
                control={<Checkbox />}
                label="Scratches"
                onChange={(e) => {
                  setCheckedValues((prev) => {
                    return { ...prev, Scratches: !prev.Scratches };
                  });
                  setCheckStates((prev) => {
                    let x = [...prev];
                    x[2] = !x[2];
                    return [...x];
                  });
                }}
                checked={checkStates[2]}
              />
              <FormControlLabel
                control={<Checkbox />}
                label="Foreign Particles"
                onChange={(e) => {
                  setCheckedValues((prev) => {
                    return {
                      ...prev,
                      "Foreign Particles": !prev["Foreign Particles"],
                    };
                  });
                  setCheckStates((prev) => {
                    let x = [...prev];
                    x[3] = !x[3];
                    return [...x];
                  });
                }}
                checked={checkStates[3]}
              />
              <FormControlLabel
                control={<Checkbox />}
                label="Discoloration"
                onChange={(e) => {
                  setCheckedValues((prev) => {
                    return { ...prev, Discoloration: !prev.Discoloration };
                  });
                  setCheckStates((prev) => {
                    let x = [...prev];
                    x[4] = !x[4];
                    return [...x];
                  });
                }}
                checked={checkStates[4]}
              />
               <FormControlLabel
                control={<Checkbox />}
                label="Others"
                onChange={(e) => {
                  setCheckedValues((prev) => {
                    return { ...prev,Others: !prev.Others };
                  });
                  setCheckStates((prev) => {
                    let x = [...prev];
                    x[5] = !x[5];
                    return [...x];
                  });
                }}
                checked={checkStates[5]}
              />
              <FormControlLabel
                control={<Checkbox />}
                label="Crack"
                onChange={(e) => {
                  setCheckedValues((prev) => {
                    return { ...prev,Crack: !prev.Crack };
                  });
                  setCheckStates((prev) => {
                    let x = [...prev];
                    x[6] = !x[6];
                    return [...x];
                  });
                }}
                checked={checkStates[6]}
              />
            </div>
          </FormGroup> */}
          {/* check box above */}



          {/* {sdefect} */}
<Grid xs={3.5}>
<span className="checks"> Defect Types</span>
          <Multiselect
            isObject={false}
            // onKeyPressFn={(e)=>harsha(e)}
            onRemove={removedefect}
            onSearch={function noRefCheck() {}}
            onSelect={(e) => {
              selectdefect(e);
              console.log(e);

              if (e.includes("All")) {
                setCheckedValues((prev) => {
                  return { ...prev, Discoloration: true,Scratches: true,"Good Bottle": true,"Foreign Particles": true,"Bottle Cap": true, Others: true };
                });
              }else{
              if (e.includes("Discoloration")) {
                setCheckedValues((prev) => {
                  return { ...prev, Discoloration: true };
                });
              }
              if (e.includes("Scratches")) {
                setCheckedValues((prev) => {
                  return { ...prev, Scratches: true };
                });
              }
              if (e.includes("Foreign Particles")) {
                setCheckedValues((prev) => {
                  return { ...prev, "Foreign Particles": true };
                });
              }
              // if (e.includes("Chipping")) {
              //   setCheckedValues((prev) => {
              //     return { ...prev, "Chipping": true };
              //   });
              // }
              if (e.includes("Bottle Cap")) {
                setCheckedValues((prev) => {
                  return { ...prev, "Bottle Cap": true };
                });
              }
              if (e.includes("Good Bottle")) {
                setCheckedValues((prev) => {
                  return { ...prev, "Good Bottle": true };
                });
              }
              if (e.includes("Others")) {
                setCheckedValues((prev) => {
                  return { ...prev, Others: true };
                });
              }
              }
            }}
            options={[
              "All",
              "Scratches",
              "Discoloration",
              "Foreign Particles",
              
              "Bottle Cap",
              "Good Bottle",
              "Others",
            ]}
            showCheckbox
          />
          </Grid>
        
{/* above is for drop down check box */}

          <Button
            type="submit"
            className="dashboard-submitbtn"
            onClick={applyFilterHandler}
            disabled={disable}
          >
            Submit
          </Button>
        </Paper>
        <div style={{padding:"11px",display:"flex"}}>
        <button className="graphs" onClick={() => settab(true)}  style={ tab ? { backgroundColor:'#0f206c',width:"50vw",height:"5vh",color:'white',cursor: "pointer",border:"none"} : {backgroundColor:'grey',width:"50vw",height:"5vh",color:'black',fontWeight:'bold',cursor: "pointer",border:"none"}} >Graphs</button>



<button className="defect" onClick={()=>settab(false)} style={ tab ? {backgroundColor:'grey',width:"50vw",height:"5vh",color:'black',fontWeight:'bold',cursor: "pointer",border:"none"}: { backgroundColor:'#0f206c',width:"50vw",height:"5vh",color:'white',cursor: "pointer",border:"none"} } >Defect log table</button>
</div>
      </Grid>

      {tab ? (
        <>
          <Grid xs={4}>
            <Paper className="bar-chart" >
              {disable ? <div class="loader">
  <div class="outer"></div>
  <div class="middle"></div>
  <div class="inner"></div>
</div>: <DynamicChart />}
            </Paper>
          </Grid>
          {table ? (
            <>
              <Grid xs={4}>
                <Paper className="bar-chart ">
                  {disable ? <div className="spinner"></div> : <PieChart />}
                </Paper>
              </Grid>
              <Grid xs={4}>
              
                <Paper className="bar-chart">
                  {disable ? (
                    <div class="balls">
                      <div></div>
                      <div></div>
                      <div></div>
                    </div>
                  ) : (
                    <span className="harsha" style={{overflowX:"auto",width:"490px",height:"400px"}}>
                    <LineChart />
                    </span>
                    )}
                </Paper>
              </Grid>
            </>
          ) : (
            <Grid xs={6}>
              <Paper className="bar-chart">
              </Paper>
            </Grid>
          )}
        </>
      ) : (
        <Grid xs={12}>
          <DefectsTable
            fromDate={checkedValues.fromDate}
            toDate={checkedValues.toDate}
          />
        </Grid>
      )}
    </Grid>
  );
}

export default Dashboard;
