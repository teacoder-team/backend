import { Ctx, Start, Update } from 'nestjs-telegraf'
import { Context } from 'telegraf'

@Update()
export class StartCommand {
	@Start()
	public async handle(@Ctx() ctx: Context) {
		await ctx.reply(`Привет, ${ctx.from.first_name}!`)
	}
}
