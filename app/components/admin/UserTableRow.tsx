import type { User } from "~/models/user.server";
import type { ExpertiseLevel } from "@prisma/client";

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
  const usersExpertiseLevels = user.expertiseLevels;
  return (
    <tr>
      <td>
        <input type="checkbox" disabled />
      </td>
      <td>{user.email}</td>
      <td>
        <input
          type="checkbox"
          checked={user.isAdmin}
          className="checkbox"
          disabled={submitting}
          onChange={() => {
            const data = new FormData();
            data.set("isAdmin", user.isAdmin ? "false" : "true");
            onUpdate(data);
          }}
        />
      </td>
      <td>
        <ul className="flex">
          {expertiseLevels.map((expertiseLevel) => {
            return (
              <li key={expertiseLevel}>
                <div className="form-control">
                  <label className="label cursor-pointer">
                    <span className="label-text">{expertiseLevel}</span>
                    <input
                      type="checkbox"
                      checked={usersExpertiseLevels.includes(expertiseLevel)}
                      className="checkbox ml-2"
                      disabled={submitting}
                      onChange={() => {
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
                  </label>
                </div>
              </li>
            );
          })}
        </ul>
      </td>
      <td>
        <button className="btn-sm btn" disabled>
          Change password
        </button>
      </td>
    </tr>
  );
};
