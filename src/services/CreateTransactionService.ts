import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Category from '../models/Category';
import Transaction from '../models/Transaction';
import TransactionRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionRepository);

    const categoryRepository = getRepository(Category);

    if (type === 'outcome') {
      const { income } = await transactionRepository.getBalance();

      if (value >= income) {
        throw new AppError('You dont hava money');
      }
    }

    let existsCategory = await categoryRepository.findOne({
      where: { title: category },
    });

    if (!existsCategory) {
      existsCategory = categoryRepository.create({
        title: category,
      });

      await categoryRepository.save(existsCategory);
    }

    const transaction = transactionRepository.create({
      value,
      title,
      type,
      category: existsCategory,
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
