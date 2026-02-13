export class Users {

  private _id!: number;
  private _name!: string;
  private _date_exp!: Date;     // Timestamp => Date
  private _birthday!: Date;     // java.sql.Date => Date


  get id(): number {
    return this._id;
  }

  set id(value: number) {
    this._id = value;
  }

  get name(): string {
    return this._name;
  }

  set name(value: string) {
    this._name = value;
  }

  get date_exp(): Date {
    return this._date_exp;
  }

  set date_exp(value: Date) {
    this._date_exp = value;
  }

  get birthday(): Date {
    return this._birthday;
  }

  set birthday(value: Date) {
    this._birthday = value;
  }
}
