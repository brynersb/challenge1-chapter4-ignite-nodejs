import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

let createStatementUseCase: CreateStatementUseCase;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository

describe("Create Statement", () => {
  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
  });

  it("should be able to create a new statement", async () => {
    
    const user: ICreateUserDTO = {
      name: "bryner",
      email: "bryner@gmail.com",
      password: "123456"
    }

    const userCreated = await inMemoryUsersRepository.create(user)

    const deposit = { type: OperationType.DEPOSIT, amount: 20000, description: "Deposito" }

    const statementDepositCreated = await createStatementUseCase.execute({
      user_id: userCreated.id as string,
      type: deposit.type,
      amount: deposit.amount,
      description: deposit.description
    })

    const withdraw = { type: OperationType.WITHDRAW, amount: 1000, description: "Retirada" }

    const statementWithdrawCreated = await createStatementUseCase.execute({
      user_id: userCreated.id as string,
      type: withdraw.type,
      amount: withdraw.amount,
      description: withdraw.description
    })

    expect(statementDepositCreated).toHaveProperty("id")

    expect(statementWithdrawCreated).toHaveProperty("id")


  });

  it("should not be able to create a new statement with nonexistent user", () => {
    expect(async () => {
      const statement = {
        type: OperationType.DEPOSIT, amount: 20000, description: "Deposito"
      }

      await createStatementUseCase.execute({
        user_id: "123",
        type: statement.type,
        amount: statement.amount,
        description: statement.description
      })
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound)
  });

  it("should not be able to create a new statement with balance less than amount", () => {
    expect(async () => {

      const user: ICreateUserDTO = {
        name: "bryner",
        email: "bryner@gmail.com",
        password: "123456"
      }

      const userCreated = await inMemoryUsersRepository.create(user)

      const statement = {
        type: OperationType.WITHDRAW, amount: 20000, description: "Retirada"
      }

      await createStatementUseCase.execute({
        user_id: userCreated.id as string,
        type: statement.type,
        amount: statement.amount,
        description: statement.description
      })


    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds)
  });


});