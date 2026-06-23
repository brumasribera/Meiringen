import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { getOrganizations } from "@/lib/data";
import { deleteOrganizationAction } from "@/lib/actions/admin";

type Props = { params: Promise<{ locale: string }> };

export default async function AdminOrganizationsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const organizations = await getOrganizations({ includeHidden: true });

  return (
    <div>
      <div className="mb-6 flex justify-between">
        <h2 className="text-xl font-semibold">Organizations</h2>
        <Link
          href="/admin/organizations/new"
          className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-white"
        >
          + New
        </Link>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-primary/5">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Category</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {organizations.map((org) => (
              <tr key={org.id} className="border-b border-border last:border-0">
                <td className="p-4 font-medium">{org.name}</td>
                <td className="p-4 text-muted">{org.category}</td>
                <td className="p-4 text-muted">{org.status}</td>
                <td className="p-4">
                  <Link href={`/admin/organizations/${org.id}/edit`} className="text-primary hover:underline">
                    Edit
                  </Link>
                  <form action={deleteOrganizationAction.bind(null, org.id)} className="inline ml-4">
                    <button type="submit" className="text-red-600 hover:underline">Delete</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
