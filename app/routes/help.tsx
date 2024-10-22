import { Link } from "@remix-run/react";
import { WORKFLOW_CONFIG_FILENAME } from "~/bartender-client/constants";
import { useInPortalMode } from "~/portal";

export default function Help() {
  const inPortalModel = useInPortalMode();
  return (
    <main>
      <h1 className="py-4 text-2xl">Help</h1>
      <ul className="list-inside list-decimal">
        <li>
          <a href="#user" className="underline">
            User
          </a>
        </li>
        <li>
          <a href="#submit" className="underline">
            Submit
          </a>
          <ul className="ml-4 list-inside list-decimal">
            <li>
              <a href="#scenario" className="underline">
                Scenario
              </a>
            </li>
            <li>
              <a href="#build" className="underline">
                Build a workflow from scratch
              </a>
            </li>
            <li>
              <a href="#upload" className="underline">
                Upload a file
              </a>
            </li>
          </ul>
        </li>
        <li>
          <a href="#manage" className="underline">
            Manage jobs
          </a>
        </li>
        <li>
          <a href="#results" className="underline">
            Results
          </a>
        </li>
      </ul>

      <h2 id="user" className="py-4 text-xl">
        User
      </h2>

      {inPortalModel ? (
        <p className="py-2">
          When you have not logged in before you can login on the{" "}
          <a href="/new/login" className="underline">
            login page
          </a>{" "}
          or register a new account on the{" "}
          <a href="/new/registration" className="underline">
            register page
          </a>
          .
        </p>
      ) : (
        <p className="py-2">
          When you have not logged in before you can login on the{" "}
          <Link to="/login" className="underline">
            login page
          </Link>{" "}
          with your socials like{" "}
          <a href="https://aai.egi.eu/" className="underline">
            EGI Check-in account
          </a>{" "}
          or{" "}
          <a href="https://orcid.org" className="underline">
            Orcid account
          </a>{" "}
          or register a new account on the{" "}
          <Link to="/register" className="underline">
            register page
          </Link>
          . After registration you will be logged in immediately.
        </p>
      )}

      <p className="py-2">
        To submit a job you need to be logged in and have an expertise level
        assigned to you. The expertise level controls which parameters in each
        Haddock3 module you can set. For example the{" "}
        <a
          className="underline"
          href="https://www.bonvinlab.org/haddock3/modules/topology/haddock.modules.topology.topoaa.html#autohis"
        >
          autohis parameter
        </a>{" "}
        in the topaa module can only be set by users with an expertise level of
        expert or higher. The site administrators will assign you an expertise
        level after you have logged in for the first time.
      </p>

      <p className="py-2">
        On your{" "}
        <Link to="/profile" className="underline">
          profile page
        </Link>{" "}
        you can see your expertise levels. If you have multiple expertise levels
        you can pick the one you want to use when building a workflow.
      </p>
      <p className="py-2">
        The website uses dark or light theme depending on your Operating Systems
        or browsers preference. The theme can be overriden on the profile page.
      </p>
      <h2 id="submit" className="py-4 text-xl">
        Submit
      </h2>

      <p>A Haddock3 job can be constructed and submitted in different ways:</p>

      <h3 className="py-4 text-lg" id="scenario">
        Scenario
      </h3>

      <p className="py-2">
        When you have a specific task in mind, you can use the{" "}
        <Link to="/scenarios" className="underline">
          scenario page
        </Link>{" "}
        to select a predefined workflow.
      </p>

      <p className="py-2">
        To submit a scenario, you need to provide the PDB files with molecules
        and the required information for the scenario.
      </p>

      <p className="py-2">
        Once you filled in the scenario form, you can submit the job by clicking
        the submit button. Or you can download the generated workflow for later
        use by clicking the download button. Or when you want to modify the
        workflow, you can click the refine button to go to the build page, make
        any changes you want and submit..
      </p>

      <h3 className="py-4 text-lg" id="build">
        Build a workflow from scratch
      </h3>

      <p className="py-2">
        When you do not have a workflow, but know exactly what you want to do,
        then you can build a Haddock3 workflow from scratch on the{" "}
        <Link to="/builder" className="underline">
          build page
        </Link>
        .
      </p>

      <p className="py-2">
        To build a workflow first you need to supply the PDB files with
        molecules. Then you can add modules to the workflow by dragging them
        from the left panel to the middle panel. Each module can be configured
        by clicking on it.
      </p>

      <p className="py-2">
        To switch between a list of modules or the text representation of the
        workflow click on the Visual/Text tabs.
      </p>

      <p className="py-2">
        Information on modules can be found in the{" "}
        <a
          href="https://www.bonvinlab.org/haddock3/modules/index.html"
          className="underline"
        >
          Haddock3 command line documentation
        </a>
      </p>

      <p>
        It is common to have the topoaa topology module as the first module and
        the caprieval module as the last module in the workflow.
      </p>

      <h3 id="upload" className="py-4 text-lg">
        Upload a file
      </h3>

      <p>
        When you have a workflow and its data files ready for use, then you can
        upload a zip file with the workflow and its data files on the{" "}
        <Link to="/upload" className="underline">
          upload page
        </Link>
        . The workflow file must be called {WORKFLOW_CONFIG_FILENAME}.
      </p>

      <h2 id="manage" className="py-4 text-xl">
        Manage jobs
      </h2>

      <p className="py-2">
        After you submit a job it can take some time before it is finished.
        Right after submission you will see the status page for the current job.
        You can refresh the page to see the current status of the job.
      </p>

      <div>
        A job goes through the following states:
        <ul className="list-inside list-disc">
          <li>
            New - The input files are being validated, unpacked and copied to a
            location where the future running job can read them.
          </li>
          <li>Queued - Job is waiting in queue for its turn.</li>
          <li>Running - Job is currently running.</li>
          <li>
            Staging out - The output files are being copied from where the job
            was run to where the webapp can access them.
          </li>
          <li>OK - The job has finished successfully.</li>
          <li>
            Error - The job has finished with an error. Look at the logs for
            hints why it errored.
          </li>
        </ul>
      </div>

      <p className="py-2">
        If you want to see all the jobs you submitted, you can go to the{" "}
        <Link to="/jobs" className="underline">
          jobs page
        </Link>
        . On the jobs page you can go to the job results page by clicking on the
        job. You can also rename the job by clicking on the pencil icon. And you
        can delete the job by clicking on the X icon. Deleting a job will cancel
        the job when its still queued or running. After deletion all the data of
        the job is gone forever.
      </p>

      <h2 id="results" className="py-4 text-xl">
        Results
      </h2>

      <p className="py-2">
        Once a job is completed you can see the results on the job results page.
      </p>

      <h3 className="py-4 text-lg">Report</h3>

      <p className="py-2">
        The report page shows data of the last caprieval module of the workflow.
        Caprieval uses the Haddock3 scoring function to score the structures
        and/or clusters. If the workflow has a clustering module then clusters
        are shown with the best 4 structures of each cluster. The structures and
        clusters are shown in a table with the scores. Each score is also
        plotted against each other and each cluster is plotted against a score.
      </p>

      <p className="py-2">
        You can view in 3D or download the best ranked structures individually
        by in the table clicking on the view or download link. You can download
        all the best structures in a zip file by clicking the{" "}
        <i>Download best ranked</i> button.
      </p>

      <p className="py-2">
        If you want to run the job again with slightly different parameters, you
        can click the <i>Edit</i> button.
      </p>

      <h3 className="py-4 text-lg">Browse</h3>

      <p className="py-2">
        From the report page you can go to the browse page. The browse allows
        you the see all the files of the job and see results of intermediate
        modules. When a workflow does not have a caprieval module, then the
        report page is unavailable.
      </p>

      <div className="py-2">
        The browse page has 4 columns:
        <ul className="list-inside list-disc">
          <li>Job info - like its id, when it ran and logs.</li>
          <li>
            Input - The workflow and its datafiles that was used as the input
            for the job.
          </li>
          <li>
            Module output - Output of each module. You can browse the files or
            perform actions:
            <ul className="ml-2 list-inside list-disc">
              <li>
                🔧 Re-run - Re-run the module with different parameters. Only
                shown for certain modules.
              </li>
              <li>&#128202; View - View the plots created by the module.</li>
              <li>
                🏆 Best ranked download - Download the best ranked structures.
                Only present for modules that perform ranking.
              </li>
              <li>
                &#128230; Download - Download the files of the module as an
                archive.
              </li>
              <li>&#128208; Report - Report of output of the module.</li>
            </ul>
          </li>
          <li>
            Other output files - Output files of Haddock3 not belonging to a
            module.
          </li>
        </ul>
      </div>
    </main>
  );
}
