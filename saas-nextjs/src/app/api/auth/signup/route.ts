import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { dbPool } from '@/lib/mysql/db'

export async function POST(request: Request) {
  try {
    const { fullName, email, password } = await request.json()

    const [existentes]: any = await dbPool.execute(
      'SELECT id FROM usuarios WHERE email = ? LIMIT 1',
      [email]
    )

    if (existentes && existentes.length > 0) {
      return NextResponse.json(
        { error: 'Este e-mail corporativo já está cadastrado no MySQL.' },
        { status: 409 }
      )
    }

    const senhaHash = await bcrypt.hash(password, 12)

    await dbPool.execute(
      'INSERT INTO usuarios (nome_completo, email, senha_hash) VALUES (?, ?, ?)',
      [fullName, email, senhaHash]
    )

    return NextResponse.json({
      success: true,
      message: 'Conta gravada com sucesso na tabela usuarios do MySQL Workbench!',
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Erro ao gravar no MySQL Workbench: ' + err.message },
      { status: 500 }
    )
  }
}
