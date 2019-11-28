import React from "react";
import { render } from "react-dom";
import Paper from "@material-ui/core/Paper";
import logo from './logo.png';
import ApiCep from './Services/ApiCep';
import { ViewState, EditingState, IntegratedEditing } from "@devexpress/dx-react-scheduler";
import './App.css';
import {
  Scheduler,
  WeekView,
  DayView,
  ViewSwitcher,
  Toolbar,
  DateNavigator,
  TodayButton,
  AppointmentTooltip,
  AppointmentForm,
  Appointments
} from "@devexpress/dx-react-scheduler-material-ui";
import { MuiThemeProvider, createMuiTheme } from "@material-ui/core/styles";
import { teal } from "@material-ui/core/colors";
import { appointments } from "./data";
var c = '#3dcd9b';

const theme = createMuiTheme({ palette: { type: "light", primary: teal } });
const Appointment: React.ComponentType<Appointments.AppointmentProps> = (props) => {
  return <Appointments.Appointment {...props} style={{ backgroundColor: '#3dcd9b' }} />;
};

class App extends React.PureComponent<any, any>{
  constructor(props: any) {
    super(props);

    this.state = {
      data: [],
      addedAppointment: {},
      appointmentChanges: {},
      searcharr: [],
      tela: 0,
      editingAppointmentId: undefined,
      showPersons: 0,
      locale: 'pt-BR',
      rua: '',
      bairro: '',
      cidade: '',
      estado: '',

    };
    this.consulta = this.consulta.bind(this);
    this.paciente = this.paciente.bind(this);



    this.changeLocale = event => this.setState({ locale: event.target.value });
    this.commitChanges = this.commitChanges.bind(this);
    // this.changeAddedAppointment = this.changeAddedAppointment.bind(this);
    // this.changeAppointmentChanges = this.changeAppointmentChanges.bind(this);
    // this.changeEditingAppointmentId = this.changeEditingAppointmentId.bind(this);
    // this.onKeyDown = this.onKeyDown.bind(this);
    // this.onKeyUp = this.onKeyUp.bind(this);
  }
  handleDados(e) {
    // Pegando o CEP
    const cep = e.target.value;
    // Consultando a API
    ApiCep.SearchCep(cep).then((res) => {
      let rua = res.data.logradouro;
      let bairro = res.data.bairro;
      let cidade = res.data.localidade;
      let estado = res.data.uf;
      // Mudando o estado
      this.setState({
        rua: rua
        , bairro: bairro
        , cidade: cidade
        , estado: estado
      })
    })
  }


  removePersonFromArray = (person, theArray) => {
    let existingPerson = theArray.indexOf(person);
    if (existingPerson > -1) {
      theArray.splice(existingPerson, 1)
    }
  }

  setAttributes = (el, attrs) => {
    for (var key in attrs) {
      el.setAttribute(key, attrs[key]);
    }
  }

  procurarPacientes = () => {
    const endpoint = this.state.data
    let search_box = document.getElementById('search-box')
    let people = document.getElementById('people')
    let arr = []

    let term = search_box.value
    people.innerHTML = ''
    if (term === '' || term === ' ') {
      people.innerHTML = ''
      arr = []
      { this.setState({ ...this.state, showPersons: 0, tela: 2 }) }
      return
    }

    endpoint.filter(appoint => {
      const id = appoint.id;
      const key = appoint.name;

      if (key.toLowerCase().includes(term.toLowerCase()) && !arr.includes(key)) {
        arr.push(key);
        let t = document.createElement('div')
        let para = document.createElement('p')
        let n = document.createTextNode(`${key}`)
        para.appendChild(n)
        this.setAttributes(t, { id: id, class: 'title' })
        { this.setState({ ...this.state, showPersons: 2 }) }
        t.appendChild(para)
        people.appendChild(t)
      } else if (!key.toLowerCase().includes(term.toLowerCase()) && arr.includes(key)) {
        this.removePersonFromArray(key, arr)
        document.getElementById(id).remove()
      } else if (key.toLowerCase().includes(term.toLowerCase()) && arr.includes(key)) {
        return
      }
    })
  }
  commitChanges({ added, changed, deleted }) {
    this.setState((state) => {
      let { data } = state;
      if (deleted !== undefined) {
        alert("A consulta foi deletada com sucesso!");
        fetch('https://pief-api.herokuapp.com/appointment/' + deleted, {
          method: 'DELETE',
        }).then(function (response) {
          console.log(response.text())

        });

        data = data.filter(appointment => appointment.id !== deleted);


      }
      return { data };
    });

  }



  request01 = () => {
    // create an XHR object
    const xhr = new XMLHttpRequest();

    // listen for `onload` event
    xhr.onload = () => {
      // process response
      if (xhr.response) {
        // parse JSON data
        const rs = JSON.parse(xhr.response);

        const listappointment = rs.appointments.map((appointment) => {
          return (
            {
              title: appointment.paciente.nome,
              type: appointment.procedimento.nome,
              startDate: new Date(Date.parse(appointment.data_inicial)),
              endDate: new Date(Date.parse(appointment.data_final)),
              id: appointment.id,
            }
          )
        }
        );

        this.setState({ ...this.state, data: listappointment })
      }
    };

    // create a `GET` 0equest
    xhr.open('GET', 'https://pief-api.herokuapp.com/appointments');

    // send request
    xhr.send();


  };

  consulta(event) {
    event.preventDefault();
    const data = new FormData(event.target);
    document.getElementById('consulta').reset();
    fetch('https://pief-api.herokuapp.com/appointment/0', {
      method: 'POST',
      body: data,
    }).then(function (response) {
      console.log(response.text())
      alert("Consulta cadastrada com sucesso!")
    });

  }
  paciente(event) {
    event.preventDefault();
    const datap = new FormData(event.target);
    document.getElementById('paciente').reset();
    fetch('https://pief-api.herokuapp.com/patient/-1', {
      method: 'POST',
      body: datap,
    }).then(function (response) {
      alert("Paciente cadastrado com sucesso!")
      console.log(response.text())
    })
      .catch(function (error) {
        console.log('There has been a problem with your fetch operation: ' + error.message);
      });

  }



  render() {

    this.request01();
    const bro = () => {
      return (<WeekView startDayHour={8} endDayHour={19} name="Mes" />)
    }
    const cell = () => {
      return (<DayView startDayHour={8} endDayHour={18} name="Dia">{<button class="print-button" onClick={() => window.print()}><span class="print-icon"></span></button>}</DayView>)
    }
    const hoje = () => {
      return ("HOJE")
    }
    const {
      data, addedAppointment, appointmentChanges, editingAppointmentId, locale,
    } = this.state;

    const calendario = () => {
      return (<div id="teste">
        <button
          onClick={() => {
            console.log(this.state.data)
            this.setState({ ...this.state, showPersons: 1, tela: 3 })
          }} class="button button1">Cadastro de pacientes</button>
          <button
            onClick={() => this.setState({ ...this.state, showPersons: 0, tela: 1 })} class="button button1">Cadastro de consulta</button>
        <MuiThemeProvider theme={theme} locale={locale}>

          <Paper>

            <Scheduler data={data} locale={locale}>

              <ViewState />
              <EditingState
                onCommitChanges={this.commitChanges}
              />
              <IntegratedEditing />
              {bro()}
              {cell()}
              <Toolbar />
              <ViewSwitcher />
              <DateNavigator locale={locale} />
              <TodayButton ></TodayButton>
              <Appointments
                appointmentComponent={Appointment}
              />
              <AppointmentTooltip
                showCloseButton
                showDeleteButton
              />
              <AppointmentForm />
            </Scheduler>
          </Paper>
        </MuiThemeProvider>
      </div>)
    };
    const cadastroP = () => {
      return (
        <div>
          <button
            onClick={() => this.setState({ ...this.state, showPersons: 0, tela: 0 })} class="button button1">Calendario</button>
          <button
            onClick={() => this.setState({ ...this.state, showPersons: 0, tela: 1 })} class="button button1">Cadastro de consulta</button>
          <form onSubmit={this.paciente} id="paciente">

            <h1>Cadastro de pacientes</h1>
            {/* <div class="row">
              <input type="number" name="id" data-parse="id" id="id" placeholder="Nao Obrigatorio" />
              <label for="id">ID</label>
            </div> */}
            <div class="row">
              <input type="text" name="nome" data-parse="nome" id="nome" placeholder="Ana Pereira" required />
              <label for="nome">Nome</label>
            </div>
            <div class="row">
              <input type="email" name="email" data-parse="email" id="email" placeholder="exemplo@exemplo.com.br" required />
              <label for="email">Email</label>
            </div>
            <div class="row">
              <input type="text" name="rg" data-parse="rg" id="rg" />
              <label for="rg">RG</label>
            </div>
            <div class="row">
              <input type="text" name="cpf" data-parse="cpf" id="cpf" required />
              <label for="cpf">CPF</label>
            </div>
            <div class="row">
              <input type="text" name="celular" data-parse="celular" id="celular" />
              <label for="celular">Celular</label>
            </div>
            <div class="row">
              <input type="text" name="fixo" data-parse="fixo" id="fixo" />
              <label for="fixo">Fixo</label>
            </div>
            <div class="row">
              <h3>Enviar Lembrete</h3>
              <input type="checkbox" name="pode_enviar_lembrete" data-parse="pode_enviar_lembrete" id="pode_enviar_lembrete" />
              <label for="pode_enviar_lembrete">Lembrete</label>
            </div>
            <div class="row">
              <select id="sexo" name="sexo" data-parse="sexo" name="sexo" required>
                <option disabled selected>  </option>
                <option value="M">Masculino</option>
                <option value="S">Femenino</option>
              </select>
              <label for="sexo">Sexo</label>
            </div>
            <div class="row">
              <input type="text" name="data_nasc" data-parse="data_nasc" id="data_nasc" required />
              <label for="data_nasc">nasc</label>
            </div>

            <div class="row">
              <input type="text" name="numero_unimed" data-parse="numero_unimed" id="numero_unimed" />
              <label for="numero_unimed">Carteirinha</label>
            </div>
            <div class="row">
              <textarea name="observacoes" data-parse="observacoes" id="observacoes" placeholder="Observacoes sobre o paciente"></textarea>
              <label for="observacoes">Observação</label>
            </div>
            <h1>Endereco</h1>
            <div class="row">
              <input type="text" name="cep" data-parse="cep" id="cep" onBlur={this.handleDados.bind(this)} size="10" maxlength="9" required />
              <label for="cep">Cep</label>
            </div>
            <div class="row">
              <input type="text" name="rua" data-parse="rua" id="rua" value={this.state.rua} />
              <label for="rua">Rua</label>
            </div>
            <div class="row">
              <input type="number" name="numero" data-parse="numero" id="numero" />
              <label for="numero">Numero</label>
            </div>
            <div class="row">
              <input type="text" name="complemento" data-parse="complemento" id="complemento" />
              <label for="complemento">Compl.</label>
            </div>
            <div class="row">
              <input type="text" name="bairro" data-parse="bairro" id="bairro" value={this.state.bairro} />
              <label for="bairro">Bairro</label>
            </div>
            <div class="row">
              <input type="text" name="cidade" data-parse="cidade" id="cidade" value={this.state.cidade} />
              <label for="cidade">Cidade</label>
            </div>
            <div class="row">
              <select id="estado" name="estado" data-parse="estado" value={this.state.estado} required>
                <option disabled selected>  </option>
                <option value="AC">Acre</option>
                <option value="AL">Alagoas</option>
                <option value="AP">Amapá</option>
                <option value="AM">Amazonas</option>
                <option value="BA">Bahia</option>
                <option value="CE">Ceará</option>
                <option value="DF">Distrito Federal</option>
                <option value="ES">Espírito Santo</option>
                <option value="GO">Goiás</option>
                <option value="MA">Maranhão</option>
                <option value="MT">Mato Grosso</option>
                <option value="MS">Mato Grosso do Sul</option>
                <option value="MG">Minas Gerais</option>
                <option value="PA">Pará</option>
                <option value="PB">Paraíba</option>
                <option value="PR">Paraná</option>
                <option value="PE">Pernambuco</option>
                <option value="PI">Piauí</option>
                <option value="RJ">Rio de Janeiro</option>
                <option value="RN">Rio Grande do Norte</option>
                <option value="RS">Rio Grande do Sul</option>
                <option value="RO">Rondônia</option>
                <option value="RR">Roraima</option>
                <option value="SC">Santa Catarina</option>
                <option value="SP">São Paulo</option>
                <option value="SE">Sergipe</option>
                <option value="TO">Tocantins</option>
              </select>
              <label for="estado">Estado</label>
            </div>
            <button type="submit" tabindex="0">Salvar</button>
          </form>
        </div>
      )
    };

    const cadastroA = () => {
      const { res, invalid } = this.state;
      return (
        <div>
          <button
            onClick={() => this.setState({ ...this.state, showPersons: 0, tela: 0 })} class="button button1">Calendario</button>
          <button
            onClick={() => this.setState({ ...this.state, showPersons: 0, tela: 3 })} class="button button1">Cadastro de pacientes</button>
          <form onSubmit={this.consulta} id="consulta">
            <h1>Cadastro de consulta</h1>
            <div class="row">
              <input type="text" placeholder="Procurar paciente" data-parse="nome_paciente" name="nome_paciente" id="nome_paciente" required></input>
              <label for="nome_paciente">Nome</label>
            </div>
            <div class="row">
              <input type="checkbox" data-parse="convenio" name="convenio" id="convenio"></input>
              <label for="convenio">Unimed</label>
            </div>
            <div class="row">
              <input type="text" name="nome_procedimento" id="nome_procedimento" placeholder="Procedimento" data-parse="nome_procedimento" />
              <label for="nome_procedimento">Proced...</label>
            </div>
            {/* <div class="row">
              <select id="nome_procedimento" name="nome_procedimento" data-parse="nome_procedimento"  required>
                <option disabled selected>  </option>
                <option value="Laser">Laser</option>
                <option value="Consulta">Consulta</option>
                <option value="Cirurgia">Cirurgia</option>
                <option value="Peeling">Peeling</option>
              </select>
              <label for="nome_procedimento">Proced...</label>
            </div> */}
            <div class="row">
              <input type="text" name="data" id="data" data-parse="date" placeholder="" required />
              <label for="data">Data</label>
            </div>
            <div class="row">
              <textarea name="observacoes" id="observacoes" data-parse="observacoes"></textarea>
              <label for="observacoes">Observação</label>
            </div>
            <button type="submit" tabindex="0">Salvar</button>
          </form>
          <div className="res-block">
          </div>
        </div>
      )
    }
    const pacientes = () => {
      return (
        <div id="people"></div>
      )
    }
    const topo = () => {
      return (
        <div id="topo">
          <img src={logo} className="App-logo" alt="logo"  onClick={() => this.setState({ ...this.state, showPersons: 0, tela: 0 })}/>
          {/* <input id="search-box" type="text" placeholder="Search People" onChange={() => {
            this.procurarPacientes()
          }}></input> */}

        </div>)
    };
    const trocaTela = () => {
      let i = this.state.tela
      if (i == 0) {
        return calendario()
      } else if (i == 1) {
        return cadastroA()
      } else if (i == 2) {
        return pacientes()
      } else if (i == 3) {
        return cadastroP()
      }
    }
    return (
      <div>
        {topo()}
        {trocaTela()}
        {pacientes()}
      </div>

    );


  }
}

render(<App />, document.getElementById("root"));





