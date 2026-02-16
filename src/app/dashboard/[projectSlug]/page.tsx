import { redirect } from 'next/navigation'

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ projectSlug: string }>
}) {
  const { projectSlug } = await params
  redirect(`/dashboard/${projectSlug}/feedbacks`)
}
