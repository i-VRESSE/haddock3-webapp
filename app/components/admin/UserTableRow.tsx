import type { UserAsListItem } from "~/bartender-client";

interface IProps {
  user: UserAsListItem;
  roles: string[];
}

export const UserTableRow = ({ user, roles }: IProps) => {
  return (
    <tr>
      <td>{user.email}</td>
      <td>
        <button className="btn btn-xs" title="Toggle">
          {user.isSuperuser ? "Yes" : "No"}
        </button>
      </td>
      <td>
        <ul>
          {roles.map((role) => {
            return (
              <li key={role}>
                {role in user.roles ? (
                  <button className="btn btn-xs">-</button>
                ) : (
                  <button className="btn btn-xs">+</button>
                )}
                <span>{role}</span>
              </li>
            );
          })}
        </ul>
      </td>
    </tr>
  );
};
