export class FilterCriteria {
	id: number;
	operator: number;
	name: string;	
	value: number;

	constructor(name: string, value: number, operator: number){
		this.name = name;
		this.value = value;
		this.operator = operator;
	}
}