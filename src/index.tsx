import React from "react";
import { render } from "react-dom";
import Paper from "@material-ui/core/Paper";
import { ViewState } from "@devexpress/dx-react-scheduler";
import {
  Scheduler,
  WeekView,
  Appointments
} from "@devexpress/dx-react-scheduler-material-ui";
import { MuiThemeProvider, createMuiTheme } from "@material-ui/core/styles";
import { blue } from "@material-ui/core/colors";
import { appointments } from "./data";

const theme = createMuiTheme({ palette: { type: "light", primary: blue } });

class App extends React.PureComponent <any,any>{
  constructor(props: any) {
    super(props);

    this.state = {
      data: appointments
    };
  }
  render() {
    const { data } = this.state;

    return (
      <MuiThemeProvider theme={theme}>
        <Paper>
            <a>aaa</a>
          <Scheduler data={data}>
            <ViewState currentDate="2018-06-28" />
            <WeekView startDayHour={9} endDayHour={19} />
            <Appointments />
          </Scheduler>
        </Paper>
      </MuiThemeProvider>
    );
  }
}

render(<App />, document.getElementById("root"));
