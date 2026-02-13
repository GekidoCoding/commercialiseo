  export class UsersDto {

    public id!: number;
    public name!: string;
    public date_exp!: Date;     // Timestamp => Date
    public birthday!: Date;     // java.sql.Date => Date

  }
