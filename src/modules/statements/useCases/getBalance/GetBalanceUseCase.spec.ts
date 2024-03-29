import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let getBalanceUseCase: GetBalanceUseCase;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;

describe("Get Balance", () => {
  beforeEach(() => {

    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    getBalanceUseCase = new GetBalanceUseCase(inMemoryStatementsRepository, inMemoryUsersRepository);

  });

  it("should be able to show balance by id", async () => {

    const user: ICreateUserDTO = {
      name: "bryner",
      email: "bryner@gmail.com",
      password: "123456"

    };

    const userCreated = await inMemoryUsersRepository.create(user);

    const deposit = { type: OperationType.DEPOSIT, amount: 20000, description: "Deposito" };

    await inMemoryStatementsRepository.create({
      user_id: userCreated.id as string,
      type: deposit.type,
      amount: deposit.amount,
      description: deposit.description
    });

    const withdraw = { type: OperationType.WITHDRAW, amount: 1000, description: "Retirada" };

    await inMemoryStatementsRepository.create({
      user_id: userCreated.id as string,
      type: withdraw.type,
      amount: withdraw.amount,
      description: withdraw.description
    });

    const response = await getBalanceUseCase.execute({ user_id: userCreated.id as string })

    expect(response.statement.length).toBe(2)

    expect(response.balance).toBe(19000)


  });

  it("should not be able to show balance with no exists user", () => {
    expect(async () => {
      
      await getBalanceUseCase.execute({ user_id: "1234" })

    }).rejects.toBeInstanceOf(GetBalanceError);
  });
});