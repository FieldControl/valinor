import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FormatterLib {
  public readonly MONTH_FORMAT = 'MM/YYYY';
  public readonly DATE_FORMAT = 'DD/MM/YYYY';
  public readonly DATETIME_FORMAT = 'DD/MM/YYYY HH:mm';
  public readonly regexpObj = /\{([\w\:\.]+|)\}/g;
  public readonly phoneRegex = /^(\d{3})(\d{4,5})(\d{3,4})$/;

  // Masks for ngx-mask package
  public readonly masks = {
    cpf: '000.000.000-00',
    cnpj: '00.000.000/0000-00',
    cc: '0000000000-0',
    cel: '(00) 00000-0000',
    tel: '(00) 0000-0000',
    number: '9*',
    decimal: 'separator.2',
    date: 'd0/M0/0000',
    crm: '00000000-0/SS',
    cep: '00000-000',
    cnh: '00000000000',
    agency: '00000',
    verifyingDigit: '00',
    account: '000000000000',
  };

  constructor() {}

  /**
   * Converte arquivo do tipo (File) para formato base64 (string)
   * @param {File} file Arquivo para conversão
   */
  public fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  }

  /**
   * Adiciona máscara ao número de cpf
   * @param {number | string} value cpf
   */
  public formatCpf(value: number | string): string {
    if (!value) {
      return '';
    }

    const unformattedValue = value.toString().replace(/\D/g, '');
    const leadingZerosValue = `${'0'.repeat(11)}${unformattedValue}`.slice(-11);

    return leadingZerosValue.replace(
      /^(\d{3})(\d{3})(\d{3})(\d{2})$/,
      '$1.$2.$3-$4'
    );
  }

  /**
   * Adiciona máscara ao número de cep
   * @param {number | string} value cep
   */
  public formatCep(value: number | string): string {
    if (!value) {
      return '';
    }

    const unformattedValue = value.toString().replace(/\D/g, '');
    const leadingZerosValue = `${'0'.repeat(8)}${unformattedValue}`.slice(-8);

    return leadingZerosValue.replace(/^(\d{5})(\d{3})$/, '$1-$2');
  }

  /**
   * Adiciona máscara ao número de cel
   * @param {number | string} value cel
   */
  public formatCelWithDDD(value: number | string): string {
    if (!value) {
      return '';
    }

    const unformattedValue = value.toString().replace(/\D/g, '');
    const leadingZerosValue = `${'0'.repeat(11)}${unformattedValue}`.slice(-11);

    return leadingZerosValue.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
  }

  /**
   * Adiciona máscara ao número de tel
   * @param {number | string} value tel
   */
  public formatTelWithDDD(value: number | string): string {
    if (!value) {
      return '';
    }

    const unformattedValue = value.toString().replace(/\D/g, '');
    const leadingZerosValue = `${'0'.repeat(10)}${unformattedValue}`.slice(-10);

    return leadingZerosValue.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
  }

  /**
   * Adiciona máscara ao número de cnpj
   * @param {number | string} value cnpj
   */
  public formatCnpj(value: number | string): string {
    if (!value) {
      return '';
    }

    const unformattedValue = value.toString().replace(/\D/g, '');
    const leadingZerosValue = `${'0'.repeat(11)}${unformattedValue}`.slice(-14);

    return leadingZerosValue.replace(
      /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
      '$1.$2.$3/$4-$5'
    );
  }

  /**
   * Adiciona máscara ao número de conta bancária
   * @param {number | string} value Conta bancária
   */
  public formatAccount(value: number | string): string {
    if (!value) {
      return '';
    }

    if (typeof value === 'number') {
      value = value.toString();
    }

    const nConta = value.substring(5, 11).replace(/^(\d{4})(\d{1})$/, '$1-$2');

    const agencia = `Ag. ${value.substring(0, 4)}`;
    const conta = `Cc. ${nConta}`;

    return `${agencia} ${conta}`;
  }

  /**
   * Adiciona máscara de valor monetário
   * @param {string} amount Valor em reais
   */
  public formatCurrency(amount: string) {
    const normalizedAmmount =
      typeof amount === 'string' ? amount.replace(',', '.') : amount;
    const [value, suffix] = Number.parseFloat(normalizedAmmount)
      .toFixed(2)
      .split('.');
    const formattedValue = value
      .split('')
      .reverse()
      .reduce((acc, number, index, list) => {
        const isDivisibleBy3 = index > 0 && index % 3 === 0;
        if (isDivisibleBy3 && index < list.length) {
          (acc as string[]).push('.');
        }
        (acc as string[]).push(number);
        return acc;
      }, [])
      .reverse()
      .join('');

    return `R$ ${formattedValue},${suffix}`;
  }

  /**
   * Formata cada palavra com a primeira letra em maiúsculo, com exceção de 'da', 'de' e 'do'.
   * @param {string} value Texto do tipo string
   */
  public capitilizeString(value: string): string {
    return value
      .toLowerCase()
      .replace(/(?:^|\s)(?!da|de|do)\S/g, (l) => l.toUpperCase());
  }
}
