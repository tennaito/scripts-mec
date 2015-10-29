// ==UserScript==
// @version     0.14
// @name        Controle de Frequencia - Somar horas mes
// @author      marcelotmelo (https://github.com/marcelotmelo)
// @namespace   http://www.mec.gov.br/
// @description Calcula o saldo de horas a partir do controle de frequencia do MEC
// @updateURL   https://raw.githubusercontent.com/tennaito/scripts-mec/master/intramec-saldo-horas-mes.user.js
// @require     http://ajax.googleapis.com/ajax/libs/jquery/2.1.0/jquery.min.js
// @match       http://10.1.26.151/sistemas/SCF/listaFrequencia.asp?matricula=*&mes=*&ano=*&cpf=*
// @grant       GM_addStyle
// @grant       GM_getResourceText
// @copyright   2014, mec.gov.br
// ==/UserScript==


//Avoid conflicts
this.$ = this.jQuery = jQuery.noConflict(true);

function mostraSaldo() {
  
  var positivo    = 0;
  var negativo    = 0;
  var creditoNAut = 0;
  var ausente = 0;
  
  $("form[action='logonFrequencia.asp'] table:nth-child(2) tr td:nth-child(10)").each(
    function() {
      var saldo = $(this).text();  
      if(saldo && saldo.trim().length > 0 && saldo != 'Crédito ñ Aut.') {
        if(saldo.indexOf('-') != -1){
          var critica = $(this).next().next().text().trim();
          if(critica != '002' && critica != 'REG.INCOMP.') {
           	saldo = saldo.replace('-', '');
           	negativo += converteSegundos(saldo);
          }
          if(critica == 'REG.AUSENTE') {
           	saldo = saldo.replace('-', '');
           	ausente += converteSegundos(saldo);
          }
        } else {
          positivo += converteSegundos(saldo);
          var credito = $(this).next().text().trim();
          if(credito && credito.length > 0 && credito != 'Crédito ñ Aut.') {
              creditoNAut += converteSegundos(credito);
          }
        }
      }
    });
  
  saldo = 0;
  sinal = 1;
  var texto = '';
  
  if(negativo > positivo) {
    sinal = -1;
    saldo = negativo - positivo;
    texto = 'Saldo Negativo: ';
  } else if (positivo > negativo) {
    sinal = 1;
    saldo = positivo - negativo;
    texto = 'Saldo Positivo: ';
  } else {
    texto = 'Saldo Zerado: ';
  }
  texto += converteHoraMinutos(saldo);
  
  if(ausente > 0) {
    var compAusente = 0;
    
    texto += '\nAusente: ' + converteHoraMinutos(ausente);
    if(saldo > ausente) {
      compAusente = saldo - ausente;
    } else if (ausente > saldo) {
      compAusente = ausente - saldo;
    }
    texto += '\nSaldo sem Ausente: ' +  converteHoraMinutos(compAusente);
  }

  if (creditoNAut) {
    texto += '\nCredito não autorizado: ' + converteHoraMinutos(creditoNAut);
    texto += '\nTotal: ' + converteHoraMinutos(saldo+sinal*creditoNAut);  
  }
  
  
  alert(texto);
};

function converteSegundos(hora) {
  
  var separa = hora.split(':'); // separa no :
  // hora sao 60 minutos, minutos 60 segundos
 	var segundos = ((+separa[0]) * 60 * 60) + ((+separa[1]) * 60);
  return segundos;
}

function converteHoraMinutos(segundos) {
  
  var horas   = Math.floor(segundos / 3600);
  var minutos = Math.floor((segundos - (horas * 3600)) / 60);
  if(minutos < 10) {
    minutos = '0' + minutos;
  }
  if(horas < 10) {
    horas = '0' + horas;
  }
  
  return horas + ':' + minutos;
}

var btnCalcula = document.createElement("input");
btnCalcula.type = "button";
btnCalcula.value = "Calcular";
btnCalcula.onclick = mostraSaldo;

$(document).ready(
 	function() {
          var tbl = $("form[action='logonFrequencia.asp'] table:first-child tr:first-child td:first-child");
          if($(tbl).text() === 'Matrícula :') {
           	var frm = $("form[action='logonFrequencia.asp']");
           	$(frm).append($(btnCalcula));
         	}
        });
