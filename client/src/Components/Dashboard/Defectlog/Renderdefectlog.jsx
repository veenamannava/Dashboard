import React, { useState} from "react";
//getting styles for styling the table data
import "./Defectlog.modules.css";
import { BiDotsHorizontalRounded } from "react-icons/bi";
import axios from "axios";
//getting mui styles
import { styled, Box } from "@mui/system";
import ModalUnstyled from "@mui/core/ModalUnstyled";
import CloseIcon from "@mui/icons-material/Close";
// import c from "../../../../../db/"


// const pt = process.env.img;
// const PF = "http://localhost:8080/Images/";

//styling for model in the image rows in defectlog table
const StyledModal = styled(ModalUnstyled)`
  position: fixed;
  z-index: 1300;
  right: 0;
  bottom: 0;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

//styling for background of the image in model
const Backdrop = styled("div")`
  z-index: -1;
  position: fixed;
  right: 0;
  bottom: 0;
  top: 0;
  left: 0;
  -webkit-tap-highlight-color: transparent;
`;

//styling for width and height of the model in image column   background-color: rgba(255,255,255);
const style = {
  width: 800,
  height: 500,
  bgcolor: "background.paper",
  // border: "2px solid #000",
  p: 2,
  px: 4,
  pb: 3,
};

const tablestyle = {
  width: "auto",
  height: 400,
  bgcolor: "background.paper",
  // border: "2px solid #000",
  p: 2,
  px: 4,
  pb: 3,
};

//getting data from defectlog table component as props and rendering it
const Renderdefectlog = (props) => {
 
  // const path2 = Path.GetDirectoryName(`E:/Newfolder/`);

  const [open, setOpen] = useState(false);
  // const [sn, setsn] = useState();
  const [trya, settrya] = useState();
  const [sbdo, setsbdo] = useState(false);
  const [sbd, setsbd] = useState();

  const handleOpen = (row, index) => {
    console.log(row, index);
    settrya(row);
    // settrya(row.split('.').slice(0, -1));
    // console.log(trya+".jpg")
    // let b=trya.split('.').slice(0, -1)
    // console.log(trya+"hay");
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const singlebottled = () => {
    setsbdo(true);
    // console.log(props.dlitm.bottleno);
    axios
      .post("/sbottledetails", { bottleno: props.dlitm.Bottle_No })
      .then((res) => {
        setsbd(res.data);
        // setsbdo(false);
        //  console.log(sbd)
      });

    // .catch((err) => console.log(err));
  };

  
var xyz ="";
var Region ="";
// console.log(xyz + "top")


return (
    <>

      <tr>
          <td className="tdf">{ props.index + 1}</td>
        <td className="tdf">{props.dlitm.Time_Stamp}</td>
        <td
          className="tdf"
          style={
            props.dlitm.Bottle_Type == "BottleA"
              ? { color: "Green" }
              : { color: "blue" }
          }
        >
          {props.dlitm.Bottle_Type}
        </td>
        <td className="tdf">{props.dlitm.Defect}</td>
        {/* <td
          className="tdf"
          style={
            props.dlitm.Defect_Type == "Scratches"
              ? { color: "Green" }
              : props.dlitm.Defect_Type == "Discoloration"
              ? { color: "red" }
              : props.dlitm.Defect_Type == "Foreign Particles"
              ? { color: "blue" }
              : { color: "violet" }
          }
        >
          {props.dlitm.Defect_Type}
        </td> */}
        <td
          className="tdf"
          onClick={singlebottled}
          style={{ cursor: "pointer" }}
          data-toggle="modal"
          data-target="exampleModalCenter"
        >
          <BiDotsHorizontalRounded />
        </td>
      </tr>

      <StyledModal
        aria-labelledby="unstyled-modal-title"
        aria-describedby="unstyled-modal-description"
        open={sbdo}
        // onClose={handleClose}
        BackdropComponent={Backdrop}
      >
        <Box sx={tablestyle}>
          <button
            onClick={(e) => setsbdo(false)}
            style={{ float: "right", color: "red" }}
          >
            {" "}
            <CloseIcon />{" "}
          </button>

          <div className="singlebottle">
            <table>
              <thead onClick={() => setsbdo(false)}>
                <tr>
                  <th className="thf">Region</th>

                  <th className="thf">Defect Type</th>
                  <th className="thf">Image</th>

                  <th className="thf">Score </th>
                  <th className="thf">Mark False Postive</th>
                </tr>
              </thead>
              <tbody>
                {sbd && 
                  sbd.map((row, index) => {
{/* console.log(row.Image + "latest") */}
                    var name = row.Image;
    const month = ["Jan", "Feb" ,"Mar","Apr","May","Jun","Jul","Aug","Sep","Oct" ,"Nov", "Dec"];

    // var a = name.findIndex([month]);
    var m = "";
    for (let i = 0; i < month.length; i++) {
      var im = name.includes(month[i]);
      {/* console.log(im); */}

      if (im === true) {
        {/* console.log(month[i]); */}
        var m = month[i];
        
        if (name.includes("POS2")) {
           Region = "AreaScan";
        } else {
           Region = "LineScan";
        }
        break;
      }
    }
    var monthindex = name.indexOf(m);
    var imagedate = name.slice(monthindex - 2, monthindex + m.length + 4);
   
   xyz=imagedate
    console.log(xyz+"bottom");


                    return (
                      <tr key={index} className="imagepopuptable">
                       
                        <td className="tdf">
                        {/* {row.Bottle_Region} */}
                          {row.Bottle_Region== "POS1"
                            ? " NECK"
                            : row.Bottle_Region == "POS2"
                            ? "BOTTOM"
                            : row.Bottle_Region == "POS3"
                            ? "TOP"
                            : row.Bottle_Region == "POS4"
                            ? " T HALF"
                            : row.Bottle_Region == "POS5"
                            ? " B HALF"
                            : ""}
                        </td>

                        <td className="tdf">{row.Defect_Type}</td>

                        <td className="tdf">
                          <div className="image">
                            <button
                              type="button"
                              onClick={() => handleOpen(row.Image, index)}
                            >

                              <img
                                className="dli"
                                // src={`http://localhost:8080/Images/${xyz}/${Region}/${row.Image}`}
                                // src={process.env.img + xyz+"/"+Region+"/"+ row.Image}
                                // src={"/Images/" +xyz+"/"+Region+"/"+ row.Image}
                                src={process.env.REACT_APP_CLIENT_IMAGES+"/"+xyz+"/"+Region+"/"+ row.Image}
                                
                                alt=""
                                style={{
                                  border: "1px solid #ddd",
                                  borderRadius: "4px",
                                  padding: "5px",
                                  width: "30px",
                                }}
                              />
                            </button>

                            <StyledModal
                              aria-labelledby="unstyled-modal-title"
                              aria-describedby="unstyled-modal-description"
                              open={open}
                              onClose={handleClose}
                              BackdropComponent={Backdrop}
                            >
                              <Box sx={style}>
                                <button
                                  onClick={(e) => setOpen(false)}
                                  style={{ float: "right", color: "red" }}
                                >
                                  {" "}
                                  <CloseIcon />{" "}
                                </button>

                                <img
                                  // src={`http://localhost:8080/Images/${xyz}/${Region}/${trya}`}
                                  src={process.env.REACT_APP_CLIENT_IMAGES+ "/" +xyz+"/"+Region+"/"+ trya}
                                  
                                  alt=""
                                  style={{ height: "100%", width: "100%" }}
                                />
                              </Box>
                            </StyledModal>
                          </div>
                        </td>
                        <td className="tdf">{row.Score1}</td>
                        <td className="tdf">
                          <input
                            type="checkbox"
                            id="topping"
                            name="topping"
                            style={{ cursor: "pointer" }}
                            value={row.Mark_False_Positive}
                            onChange={() => {
                              singlebottled();
                              props.selectHandler(
                                row.Mark_False_Positive,
                                row.SNO
                              );
                            }}
                            checked={
                              row.Mark_False_Positive == 0 ? false : true
                            }
                          />
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </Box>
      </StyledModal>
    </>
  );
};

export default Renderdefectlog;
