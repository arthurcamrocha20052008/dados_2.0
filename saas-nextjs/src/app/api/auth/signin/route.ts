import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { SignJWT } from 'jose'
import { dbPool } from '@/lib/mysql/db'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'chave-corporativa-ultra-secreta-dashboardmagico-2026'
)

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    const [rows]: any = await dbPool.execute(
      'SELECT id, nome_completo, email, senha_hash, empresa FROM usuarios WHERE email = ? AND ativo = 1 LIMIT 1',
      [email]
    )

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { error: 'Usuário não encontrado no banco MySQL.' },
        { status: 401 }
      )
    }

    const user = rows[0]
    const senhaValida = await bcrypt.compare(password, user.senha_hash)

    if (!senhaValida) {
      return NextResponse.json(
        { error: 'Credenciais inválidas. Verifique seu e-mail e senha.' },
        { status: 401 }
      )
    }

    await dbPool.execute('UPDATE usuarios SET ultimo_login = NOW() WHERE id = ?', [user.id])

    const token = await new SignJWT({
      sub: String(user.id),
      email: user.email,
      nome: user.nome_completo,
      empresa: user.empresa,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .sign(JWT_SECRET)

    const response = NextResponse.json({ success: true })
    response.cookies.set('dm_session', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24,
    })

    return response
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Erro ao conectar ao MySQL Workbench: ' + err.message },
      { status: 500 }
    )
  }
}
