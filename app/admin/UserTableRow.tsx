import type { User } from "~/models/user.server";
import type { ExpertiseLevel } from "~/drizzle/schema.server";
import { TableCell, TableRow } from "~/components/ui/table";
import { Checkbox } from "~/components/ui/checkbox";
import { Label } from "~/components/ui/label";

interface IProps {
  user: User;
  expertiseLevels: ExpertiseLevel[];
  onUpdate: (data: FormData) => void;
  submitting: boolean;
}

export const UserTableRow = ({
  user,
  expertiseLevels,
  onUpdate,
  submitting,
}: IProps) => {
  const usersExpertiseLevels: ExpertiseLevel[] = user.expertiseLevels;
  return (
    <TableRow>
      <TableCell>{user.email}</TableCell>
      <TableCell>
        <Checkbox
          checked={user.isAdmin}
          disabled={submitting}
          onChange={() => {
            if (window.confirm("Are you sure?") === false) {
              return;
            }
            const data = new FormData();
            data.set("isAdmin", user.isAdmin ? "false" : "true");
            onUpdate(data);
          }}
        />
      </TableCell>
      <TableCell>
        <ul className="flex space-x-4">
          {expertiseLevels.map((expertiseLevel) => {
            return (
              <li key={expertiseLevel}>
                <div className="flex items-center space-x-1">
                  <Checkbox
                    checked={usersExpertiseLevels.includes(expertiseLevel)}
                    disabled={submitting}
                    id={`${user.id}-${expertiseLevel}`}
                    onCheckedChange={() => {
                      const data = new FormData();
                      data.set(
                        expertiseLevel,
                        usersExpertiseLevels.includes(expertiseLevel)
                          ? "false"
                          : "true"
                      );
                      onUpdate(data);
                    }}
                  />
                  <Label htmlFor={`${user.id}-${expertiseLevel}`}>
                    {expertiseLevel}
                  </Label>
                </div>
              </li>
            );
          })}
        </ul>
      </TableCell>
    </TableRow>
  );
};
