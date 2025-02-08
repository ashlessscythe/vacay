import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/auth.config'

// GET all holidays for company
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.role.includes('ADMIN')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const holidays = await prisma.bank_holidays.findMany({
    where: { company_id: Number(session.user.companyId) },
    orderBy: { date: 'asc' }
  })
  
  return NextResponse.json(holidays)
}

// POST create new holiday
export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.role.includes('ADMIN')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  
  const newHoliday = await prisma.bank_holidays.create({
    data: {
      name: body.name,
      date: new Date(body.date),
      company_id: Number(session.user.companyId)
    } as Prisma.bank_holidaysUncheckedCreateInput
  })
  
  return NextResponse.json(newHoliday)
}

// PUT update existing holiday
export async function PUT(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.role.includes('ADMIN')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  
  const updatedHoliday = await prisma.bank_holidays.update({
    where: { id: body.id },
    data: {
      name: body.name,
      date: new Date(body.date)
    }
  })
  
  return NextResponse.json(updatedHoliday)
}

// DELETE remove holiday
export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.role.includes('ADMIN')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await request.json()
  
  await prisma.bank_holidays.delete({
    where: { id }
  })
  
  return NextResponse.json({ success: true })
}
