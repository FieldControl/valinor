import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateColumnKanbanInput } from './dto/create-column.input';
import { UpdateColumnKanbanInput } from './dto/update-column.input';
import { ColumnKanban } from './entities/column.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteColumnKanbanInput } from './dto/delete-column.input';

@Injectable()
export class ColumnService {
	constructor(
		@InjectRepository(ColumnKanban)
		private columnRepository: Repository<ColumnKanban>,
	) { }

	async create(createColumnKanban: CreateColumnKanbanInput) {
		const column = this.columnRepository.create(createColumnKanban);
		return this.columnRepository.save(column);
	}

	findAll(): Promise<ColumnKanban[]> {
		return this.columnRepository.find();
	}


	findOne(id: number): Promise<ColumnKanban | null> {
		const column = this.columnRepository.findOneBy({ id });
		if (!column) {
			throw new NotFoundException(`Coluna com id ${id} não encontrado`);
		}
		return column;
	}

	async update(updateColumnInput: UpdateColumnKanbanInput) {
		const column = await this.columnRepository.preload(updateColumnInput);
		if (!column) {
			throw new Error(`Card com id ${updateColumnInput.id} não encontrado`);
		}
		return this.columnRepository.save(column);
	}

	async remove(removeColumnInput: DeleteColumnKanbanInput) {

		const column = await this.columnRepository.findOne({ where: { id: removeColumnInput.id } });
		if (column) {
			this.columnRepository.remove(column);
			return column;
		} else {
			throw new Error('Column not found');
		}

	}
}
